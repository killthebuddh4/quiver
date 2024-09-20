import { Message } from "../types/Message.js";
import { parseQuiverUrl } from "../url/parseQuiverUrl.js";
import { parseQuiverRequest } from "../parsers/parseQuiverRequest.js";
import { QuiverErrorResponse } from "../types/QuiverErrorResponse.js";
import { getResponseUrl } from "../url/getResponseUrl.js";
import { urlToString } from "../url/urlToString.js";
import { QuiverAppOptions } from "../types/QuiverAppOptions.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverApp } from "../types/QuiverApp.js";
import { QuiverProvider } from "../types/QuiverProvider.js";

/* ***************************************************************************
 *
 * IMPORTANT NOTE
 *
 * QuiverApp exists almost entirely to provide a type-safe "finalization" step
 * for the QuiverFunction and QuiverRouter types. A function or router can only
 * be deployed if it's input type is QuiverContext.
 *
 * **************************************************************************/

export const createApp = <
  Server extends QuiverFunction<any, any, any> | QuiverRouter<any, any, any>,
>(
  namespace: string,
  server: Server,
  options?: QuiverAppOptions,
): QuiverApp<Server> => {
  const state = {
    namespace,
    provider: undefined as QuiverProvider | undefined,
    server,
    options,
    subscription: undefined as { unsubscribe: () => void } | undefined,
  };

  const stop = () => {
    state.subscription?.unsubscribe();
  };

  const listen = async (provider: QuiverProvider) => {
    state.provider = provider;

    await provider.start();

    state.subscription = await provider.subscribe(handler);

    return {
      namespace: state.namespace,
      server: state.server,
      stop,
      listen,
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
          ctx.throw = {
            code: "PARSE_REQUEST_JSON_FAILED",
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
            code: "PARSE_REQUEST_FAILED",
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
            code: "NO_FUNCTION_FOR_PATH",
            message: `No function found for path: ${ctx.url.path.join("/")}, ${ctx.url.path}`,
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

        try {
          // TODO Will come with the hooks API.
        } catch {
          ctx.throw = {
            code: "INPUT_TYPE_MISMATCH",
          };

          break inner;
        }

        ctx.input = ctx.request.arguments;

        state.options?.logs?.onValidatedInput?.(ctx);

        /* ************************************************************************
         *
         * APPLY MIDDLEWARE
         *
         * ***********************************************************************/

        const middlewares = state.server.compile(ctx.url.path);

        for (const middleware of middlewares) {
          ctx = await middleware.exec(ctx);
        }

        state.options?.logs?.onAppliedMiddleware?.(ctx);

        /* ************************************************************************
         *
         * APPLY FUNCTION
         *
         * ***********************************************************************/

        if (ctx.function === undefined) {
          ctx.exit = {
            code: "SERVER_ERROR",
            message: "Function is undefined after matching",
          };

          break inner;
        }

        try {
          ctx.return = {
            status: "SUCCESS",
            data: await ctx.function(ctx.input, ctx),
          };
        } catch (error) {
          ctx.throw = {
            code: "HANDLER_ERROR",
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

          const err: QuiverErrorResponse = {
            id: ctx.message.id,
            ok: false,
            ...ctx.throw,
          };

          let content;
          try {
            content = JSON.stringify(err);
          } catch {
            // TODO We should be throwing here.
            ctx.exit = {
              code: "OUTPUT_SERIALIZATION_FAILED",
              reason: `Failed to serialize thrown error and fallback error`,
            };

            break reply;
          }

          // TODO We should be throwing here.
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
            // TODO We should be throwing here.
            ctx.exit = {
              code: "OUTPUT_SERIALIZATION_FAILED",
              reason: "Failed to serialize ctx.return",
            };

            break reply;
          }

          if (ctx.url === undefined) {
            // TODO We should be throwing here.
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
    namespace: state.namespace,
    server: state.server,
    stop,
    listen,
  };
};
