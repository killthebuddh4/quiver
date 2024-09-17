import * as Quiver from "../types/quiver/quiver.js";
import { Message } from "../types/Message.js";
import { parseQuiverUrl } from "../parsers/parseQuiverUrl.js";
import { parseQuiverRequest } from "../parsers/parseQuiverRequest.js";
import { Maybe } from "../types/util/Maybe.js";
import { QuiverError } from "../types/QuiverError.js";
import { QuiverServerOptions } from "../types/QuiverServerOptions.js";

export class QuiverRouter<
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]:
      | Quiver.Function<CtxOut, any, any>
      | Quiver.Router<CtxOut, any, any>;
  },
> implements Quiver.Router<CtxIn, CtxOut, Routes>
{
  public type = "QUIVER_ROUTER" as const;

  public middleware: Quiver.Middleware<CtxIn, CtxOut, any, any>;

  public routes: Routes;

  private provider?: Quiver.Provider;

  private namespace?: string;

  private options?: QuiverServerOptions;

  public constructor(
    middleware: Quiver.Middleware<CtxIn, CtxOut, any, any>,
    routes: Routes,
    options?: QuiverServerOptions,
  ) {
    this.middleware = middleware;
    this.routes = routes;
    this.options = options;
  }

  public compile(path?: string[]) {
    if (path === undefined) {
      throw new Error("Path is undefined");
    }

    if (path.length === 0) {
      throw new Error("Path is empty");
    }

    const route = this.routes[path[0]];

    if (route === undefined) {
      throw new Error(`Route not found ${path[0]}`);
    }

    const next = route.compile(path.slice(1));

    return [this.middleware.compile(), ...next];
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

    this.provider = provider;

    this.namespace = namespace;

    console.log(`ROUTER CALLING SUBSCRIBE`);

    const unsub = await provider.subscribe(this.handler.bind(this));

    return {
      stop: unsub.unsubscribe,
    };
  }

  public route(path: string[]): Maybe<(i: any, ctx: any) => any> {
    if (path.length === 0) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
      };
    }

    const route = this.routes[path[0]];

    if (route === undefined) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
      };
    }

    if (route.type === "QUIVER_FUNCTION") {
      if (path.length !== 1) {
        return {
          ok: false,
          code: "FUNCTION_NOT_FOUND",
        };
      }

      return {
        ok: true,
        value: route.route(),
      };
    } else {
      return route.route(path.slice(1));
    }
  }

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

        // TODO We really need to make this less of a hack, make the namespace stuff
        // more formalized.
        const fn = this.route(ctx.url.path.slice(1));

        if (!fn.ok) {
          ctx.throw = {
            code: "UNKNOWN_FUNCTION",
          };

          break inner;
        }

        ctx.function = fn.value;

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

        const middlewares = this.compile(ctx.url.path.slice(1));

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
