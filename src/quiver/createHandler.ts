import { Message } from "../types/Message.js";
import { parseQuiverUrl } from "../url/parseQuiverUrl.js";
import { parseQuiverRequest } from "../parsers/parseQuiverRequest.js";
import { QuiverErrorResponse } from "../types/QuiverErrorResponse.js";
import { getResponseUrl } from "../url/getResponseUrl.js";
import { urlToString } from "../url/urlToString.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { QuiverHandlerOptions } from "../types/QuiverHandlerOptions.js";
import { route } from "../router/route.js";

export const createHandler = (
  namespace: string,
  xmtp: QuiverXmtp,
  router: QuiverFunction<any, any, any> | QuiverRouter<any, any, any>,
  options?: QuiverHandlerOptions,
) => {
  /* 
    Ok, let's clarify the flow control here.

    We use ctx.exit whenever we CANNOT REPLY WITH ANYTHING.
    We use ctx.throw whenever we CANNOT REPLY WITH TYPE-SAFE DATA.
    We use ctx.reeturn whenever we CAN REPLY WITH TYPE-SAFE DATA.

    TODO We should have a fallback block for when throw/return serialization
    fails.
  */
  return async (message: Message) => {
    let ctx: QuiverContext = { message };

    outer: {
      inner: {
        /* ************************************************************************
         *
         * RECV_MESSAGE
         *
         * ***********************************************************************/

        options?.logs?.onRecvMessage?.(ctx);

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

        options?.logs?.onParsedUrl?.(ctx);

        /* ************************************************************************
         *
         * NAMESPACE
         *
         * ***********************************************************************/

        if (ctx.url.namespace !== namespace) {
          ctx.exit = {
            code: "NAMESPACE_MISMATCH",
            message: `Namespace mismatch: ${ctx.url.namespace} !== ${namespace}`,
          };

          break outer;
        }

        options?.logs?.onMatchedNamespace?.(ctx);

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

        options?.logs?.onParsedJson?.(ctx);

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

        options?.logs?.onParsedRequest?.(ctx);

        /* ************************************************************************
         *
         * ROUTING
         *
         * ***********************************************************************/

        const match = route(ctx.url.path, router);

        if (!match.success) {
          ctx.throw = {
            code: "NO_FUNCTION_FOR_PATH",
            message: `No function found for path: ${ctx.url.path.join("/")}, ${ctx.url.path}`,
          };

          break inner;
        }

        if (match.function === null) {
          ctx.throw = {
            code: "SERVER_ERROR",
            message: `Something went wrong with the router`,
          };

          break inner;
        }

        ctx.function = match.function.func;

        options?.logs?.onMatchedFunction?.(ctx);

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

        options?.logs?.onValidatedInput?.(ctx);

        /* ************************************************************************
         *
         * APPLY MIDDLEWARE
         *
         * ***********************************************************************/

        for (const middleware of match.middlewares) {
          // TODO We need to handle middleware errors. See dev notes from 2024-11-16.
          ctx = await middleware.exec(ctx);
        }

        options?.logs?.onAppliedMiddleware?.(ctx);

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

        options?.logs?.onAppliedFunction?.(ctx);
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
          options?.logs?.onThrowing?.(ctx);

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
            xmtp.signer.address,
            namespace,
            ctx.url.path,
          );

          try {
            const sent = await xmtp.publish({
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

            options?.logs?.onSentThrow?.(ctx);
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
          options?.logs?.onReturning?.(ctx);

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
            xmtp.signer.address,
            namespace,
            ctx.url.path,
          );

          try {
            const sent = await xmtp.publish({
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

            options?.logs?.onSentReturn?.(ctx);
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

    options?.logs?.onExit?.(ctx);
  };
};
