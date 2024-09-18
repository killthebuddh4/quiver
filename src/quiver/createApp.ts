import { Message } from "../types/Message.js";
import { parseQuiverUrl } from "../url/parseQuiverUrl.js";
import { parseQuiverRequest } from "../parsers/parseQuiverRequest.js";
import { QuiverError } from "../types/QuiverError.js";
import { getResponseUrl } from "../url/getResponseUrl.js";
import { urlToString } from "../url/urlToString.js";
import { QuiverAppOptions } from "../types/QuiverAppOptions.js";
import { QuiverProvider } from "./QuiverProvider.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverApp } from "../types/QuiverApp.js";

export const createApp = (
  namespace: string,
  server: QuiverFunction<any, any, any> | QuiverRouter<any, any, any>,
  options?: QuiverAppOptions,
): QuiverApp => {
  const state = {
    namespace,
    server,
    options,
    provider: options?.provider ?? new QuiverProvider(),
    subscription: undefined as { unsubscribe: () => void } | undefined,
  };

  const address = state.provider.signer.address;

  const listen = async (): Promise<QuiverApp> => {
    await state.provider.start();

    state.subscription = await state.provider.subscribe(handler);

    return {
      address: state.provider.signer.address,
      server: state.server,
      listen,
      stop,
    };
  };

  const stop = () => {
    state.subscription?.unsubscribe();

    return {
      address: state.provider.signer.address,
      server: state.server,
      listen,
      stop,
    };
  };

  /* 
    Ok, let's clarify the flow control here.

    We use ctx.exit whenever we CANNOT REPLY WITH ANYTHING.
    We use ctx.throw whenever we CANNOT REPLY WITH TYPE-SAFE DATA.
    We use ctx.reeturn whenever we CAN REPLY WITH TYPE-SAFE DATA.

    TODO We should have a fallback block for when throw/return serialization
    fails.
  */
  const handler = async (message: Message) => {
    let ctx: QuiverContext = { message };

    outer: {
      inner: {
        if (state.namespace === undefined) {
          ctx.exit = {
            code: "NAMESPACE_UNDEFINED",
          };

          break outer;
        }

        if (state.provider === undefined) {
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

        state.options?.logs?.onRecvMessage?.(ctx);

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

        state.options?.logs?.onParsedUrl?.(ctx);

        /* ************************************************************************
         *
         * NAMESPACE
         *
         * ***********************************************************************/

        if (ctx.url.namespace !== state.namespace) {
          ctx.exit = {
            code: "NAMESPACE_MISMATCH",
            message: `Namespace mismatch: ${ctx.url.namespace} !== ${state.namespace}`,
          };

          break outer;
        }

        state.options?.logs?.onMatchedNamespace?.(ctx);

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

        state.options?.logs?.onParsedJson?.(ctx);

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

        state.options?.logs?.onParsedRequest?.(ctx);

        /* ************************************************************************
         *
         * GET_FUNCTION
         *
         * ***********************************************************************/

        const fn = state.server.route(ctx.url.path);

        if (!fn.ok) {
          ctx.throw = {
            code: "UNKNOWN_FUNCTION",
          };

          break inner;
        }

        ctx.function = fn.value;

        state.options?.logs?.onMatchedFunction?.(ctx);

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

        const middlewares = state.server.compile(ctx.url.path);

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

        state.options?.logs?.onAppliedMiddleware?.(ctx);

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

        state.options?.logs?.onAppliedFunction?.(ctx);
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
          state.options?.logs?.onThrowing?.(ctx);

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

          const responseUrl = getResponseUrl(
            state.provider.signer.address,
            state.namespace,
            ctx.url.path,
          );

          try {
            const sent = await state.provider.publish({
              conversation: {
                peerAddress: ctx.message.conversation.peerAddress,
                context: {
                  conversationId: urlToString(responseUrl),
                  metadata: {},
                },
              },
              content,
            });

            ctx.sent = sent;

            state.options?.logs?.onSentThrow?.(ctx);
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
          state.options?.logs?.onReturning?.(ctx);

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

          const responseUrl = getResponseUrl(
            state.provider.signer.address,
            state.namespace,
            ctx.url.path,
          );

          try {
            const sent = await state.provider.publish({
              conversation: {
                peerAddress: ctx.message.conversation.peerAddress,
                context: {
                  conversationId: urlToString(responseUrl),
                  metadata: {},
                },
              },
              content,
            });

            ctx.sent = sent;

            state.options?.logs?.onSentReturn?.(ctx);
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

    state.options?.logs?.onExit?.(ctx);
  };

  return {
    address,
    server: state.server,
    listen,
    stop,
  };
};
