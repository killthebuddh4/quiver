import { QuiverPipeline } from "../types/QuiverPipeline.js";
import * as Quiver from "../types/quiver/quiver.js";
import { Message } from "../types/Message.js";
import { parseQuiverUrl } from "../parsers/parseQuiverUrl.js";
import { parseQuiverRequest } from "../parsers/parseQuiverRequest.js";
import { QuiverError } from "../types/QuiverError.js";
import { QuiverServerOptions } from "../types/QuiverServerOptions.js";

export class QuiverFunction<CtxIn, CtxOut, Exec extends (...args: any[]) => any>
  implements Quiver.Function<CtxIn, CtxOut, Exec>
{
  public type = "QUIVER_FUNCTION" as const;

  public middleware: Quiver.Middleware<CtxIn, CtxOut, any, any>;

  public exec: Exec;

  private provider?: Quiver.Provider;

  private namespace?: string;

  private options?: QuiverServerOptions;

  public constructor(
    middleware: Quiver.Middleware<CtxIn, CtxOut, any, any>,
    exec: Exec,
    options?: QuiverServerOptions,
  ) {
    this.middleware = middleware;
    this.exec = exec;
    this.options = options;
  }

  public typeguard(ctx: CtxIn): never {
    throw new Error(`This function should never be called ${ctx}`);
  }

  public compile(): QuiverPipeline[] {
    return [this.middleware.compile()];
  }

  public async start(
    namespace: string,
    provider?: CtxIn extends Quiver.Context
      ? Quiver.Provider | undefined
      : never,
  ) {
    if (provider === undefined) {
      throw new Error("Default provider not yet implemented");
    }

    this.namespace = namespace;

    this.provider = provider;

    const unsub = await provider.subscribe(this.handler.bind(this));

    return {
      stop: unsub.unsubscribe,
    };
  }

  public route() {
    return this.exec;
  }

  // NOTE This handler is only used when the function itself is used as the root route.
  // Otherwise, the handler in the router is used. This isn't great but fine for now, we
  // just need to keep remember to maintain parity between the two.

  /* 
    Ok, let's clarify the flow control here.

    We use ctx.exit whenever we CANNOT REPLY WITH ANYTHING.
    We use ctx.throw whenever we CANNOT REPLY WITH TYPE-SAFE DATA.
    We use ctx.reeturn whenever we CAN REPLY WITH TYPE-SAFE DATA.

    TODO We should have a fallback block for when throw/return serialization
    fails.
  */
  private async handler(message: Message) {
    let ctx: Quiver.Context = { message };

    outer: {
      inner: {
        if (this.namespace === undefined) {
          ctx.exit = {
            code: "NAMESPACE_UNDEFINED",
          };

          break outer;
        }

        if (this.provider === undefined) {
          ctx.exit = {
            code: "PROVIDER_UNDEFINED",
          };

          break outer;
        }

        /* ************************************************************************
         *
         * RECV_MESSAGE
         *
         * ***********************************************************************/

        this.options?.logs?.onRecvMessage?.(ctx);

        /* ************************************************************************
         *
         * PARSE_URL
         *
         * ***********************************************************************/

        const url = parseQuiverUrl(ctx.message);

        if (!url.ok) {
          ctx.exit = {
            code: "INVALID_URL",
            reason: `Failed to parse message because ${url.reason}`,
          };

          break outer;
        }

        ctx.url = url.value;

        this.options?.logs?.onParsedUrl?.(ctx);

        /* ************************************************************************
         *
         * NAMESPACE
         *
         * ***********************************************************************/

        if (ctx.url.path[0] !== this.namespace) {
          ctx.exit = {
            code: "NAMESPACE_MISMATCH",
          };

          break outer;
        }

        this.options?.logs?.onMatchedNamespace?.(ctx);

        /* ************************************************************************
         *
         * PARSE_JSON
         *
         * ***********************************************************************/

        try {
          ctx.json = JSON.parse(String(ctx.message.content));
        } catch (error) {
          // NOTE We're now THROWing instead of EXITing because we have a URL.
          ctx.throw = {
            code: "JSON_PARSE_FAILED",
          };

          break inner;
        }

        this.options?.logs?.onParsedJson?.(ctx);

        /* ************************************************************************
         *
         * PARSE_REQUEST
         *
         * ************************************************************************/

        const request = parseQuiverRequest(ctx.json);

        if (!request.ok) {
          ctx.throw = {
            code: "REQUEST_PARSE_FAILED",
          };

          break inner;
        }

        ctx.request = request.value;

        this.options?.logs?.onParsedRequest?.(ctx);

        /* ************************************************************************
         *
         * GET_FUNCTION
         *
         * ***********************************************************************/

        ctx.function = this.exec;

        this.options?.logs?.onMatchedFunction?.(ctx);

        /* ************************************************************************
         *
         * VALIDATE INPUT
         *
         * ***********************************************************************/

        // TODO Will come with the hooks API.

        ctx.input = ctx.request.arguments;

        /* ************************************************************************
         *
         * APPLY MIDDLEWARE
         *
         * ***********************************************************************/

        const middlewares = this.compile();

        for (const middleware of middlewares) {
          for (const stage of middleware) {
            let stageCtxIn: any = ctx;
            let stageCtxOut: any = ctx;

            for (const handler of stage) {
              try {
                // TODO This should be an async function.
                stageCtxOut = handler(stageCtxIn);
              } catch {
                ctx.throw = {
                  code: "MIDDLEWARE_ERROR",
                };

                break inner;
              }

              if (ctx.exit || ctx.throw || ctx.return) {
                break inner;
              }
            }

            ctx = stageCtxOut;
          }
        }

        this.options?.logs?.onAppliedMiddleware?.(ctx);

        /* ************************************************************************
         *
         * APPLY FUNCTION
         *
         * ***********************************************************************/

        if (ctx.function === undefined) {
          ctx.throw = {
            code: "SERVER_ERROR",
            message: "Function is undefined after matching",
          };

          break inner;
        }

        try {
          ctx.return = {
            status: "SUCCESS",
            // TODO This should be an async function.
            data: ctx.function(ctx.input, ctx),
          };
        } catch (error) {
          ctx.throw = {
            code: "SERVER_ERROR",
            message: "Function threw an error",
          };
        }

        this.options?.logs?.onAppliedFunction?.(ctx);
      }

      /* ************************************************************************
       *
       * BREAK INNER JUMPS HERE
       *
       * ***********************************************************************/

      reply: {
        /* ************************************************************************
         *
         * THROW
         *
         * ***********************************************************************/

        if (ctx.throw !== undefined) {
          this.options?.logs?.onThrowing?.(ctx);

          const err: QuiverError = {
            id: ctx.message.id,
            ok: false,
            ...ctx.throw,
          };

          let content;
          try {
            content = JSON.stringify(err);
          } catch {
            ctx.exit = {
              code: "OUTPUT_SERIALIZATION_FAILED",
              message: "Failed to serialize ctx.throw",
            };

            break reply;
          }

          if (ctx.url === undefined) {
            ctx.exit = {
              code: "URL_UNDEFINED",
              reason:
                "URL is undefined even though we're in the BREAK_INNER block",
            };

            break reply;
          }

          // TODO, how do we handle root (no path) urls?
          const conversationId = `${ctx.url.quiver}/${ctx.url.version}/responses/${this.provider.signer.address}/${ctx.url.path.join("/")}`;

          try {
            const sent = await this.provider.publish({
              conversation: {
                peerAddress: ctx.message.conversation.peerAddress,
                context: {
                  conversationId,
                  metadata: {},
                },
              },
              content,
            });

            ctx.sent = sent;

            this.options?.logs?.onSentThrow?.(ctx);
          } catch {
            ctx.exit = {
              code: "XMTP_NETWORK_ERROR",
              reason: `Failed to publish throw message`,
            };

            break reply;
          }
        }

        /* ************************************************************************
         *
         * RETURN
         *
         * ***********************************************************************/

        if (ctx.return !== undefined) {
          this.options?.logs?.onReturning?.(ctx);

          let content;
          try {
            content = JSON.stringify({
              id: ctx.message.id,
              ok: true,
              ...ctx.return,
            });
          } catch (error) {
            ctx.exit = {
              code: "OUTPUT_SERIALIZATION_FAILED",
              reason: "Failed to serialize ctx.return",
            };

            break reply;
          }

          if (ctx.url === undefined) {
            ctx.exit = {
              code: "URL_UNDEFINED",
              reason:
                "URL is undefined even though we're in the BREAK_INNER block",
            };

            break reply;
          }

          const conversationId = `${ctx.url.quiver}/${ctx.url.version}/responses/${this.provider.signer.address}/${ctx.url.path.join("/")}`;

          try {
            const sent = await this.provider.publish({
              conversation: {
                peerAddress: ctx.message.conversation.peerAddress,
                context: {
                  conversationId,
                  metadata: {},
                },
              },
              content,
            });

            ctx.sent = sent;

            this.options?.logs?.onSentReturn?.(ctx);
          } catch {
            ctx.exit = {
              code: "XMTP_NETWORK_ERROR",
              reason: `Failed to publish return message`,
            };

            break reply;
          }
        }
      }
    }

    /* ************************************************************************
     *
     * BREAK OUTER JUMPS HERE
     *
     * ***********************************************************************/

    this.options?.logs?.onExit?.(ctx);
  }
}
