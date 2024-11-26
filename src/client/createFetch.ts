import { Message } from "../types/Message.js";
import { parseQuiverResponse } from "../parsers/parseQuiverResponse.js";
import { QuiverClientOptions } from "../types/QuiverClientOptions.js";
import { QuiverUrl } from "../types/QuiverUrl.js";
import { urlToString } from "../url/urlToString.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { QuiverResult } from "../types/QuiverResult.js";

export const createFetch = (props: {
  xmtp: QuiverXmtp;
  server: { address: string };
  pending: Map<string, (response: Message) => any>;
  options?: QuiverClientOptions;
}) => {
  return async (
    url: QuiverUrl,
    args: any[],
  ): Promise<QuiverResult<unknown>> => {
    if (props.options?.xmtp?.startOnCall === false) {
      throw new Error("Not yet implemented");
    } else {
      try {
        await props.xmtp.start();
      } catch (error) {
        props.options?.xmtp?.onStartError?.(error);

        return {
          ok: false,
          error: {
            code: "XMTP_STARTUP_ERROR",
            message: "Failed to start xmtp",
          },
        };
      }
    }

    const request = {
      arguments: args,
    };

    let str: string;
    try {
      str = JSON.stringify(request);
    } catch {
      return {
        ok: false,
        error: {
          code: "INPUT_SERIALIZATION_FAILED",
          message: "Failed to serialize input",
        },
      };
    }

    let sent: Awaited<ReturnType<QuiverXmtp["publish"]>>;
    try {
      props.options?.logs?.onSendingRequest?.(request);

      sent = await props.xmtp.publish({
        conversation: {
          peerAddress: props.server.address,
          context: {
            conversationId: urlToString(url),
            metadata: {},
          },
        },
        content: str,
      });

      props.options?.logs?.onSent?.(sent);
    } catch (error) {
      props.options?.logs?.onSendError?.(request, error);

      return {
        ok: false,
        error: {
          code: "XMTP_NETWORK_ERROR",
          message: "Failed to send request",
        },
      };
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        props.pending.delete(sent.id);

        resolve({
          ok: false,
          error: {
            code: "REQUEST_TIMEOUT",
            message: `Timed out after ${props.options?.timeoutMs || 10000}ms`,
          },
        });
      }, props.options?.timeoutMs || 10000);

      props.pending.set(sent.id, (message: Message) => {
        /* ************************************************************************
         *
         * RECV RESPONSE
         *
         * ***********************************************************************/

        props.options?.logs?.onMatchedRequest?.(message);

        clearTimeout(timeout);
        props.pending.delete(sent.id);

        /* ************************************************************************
         *
         * PARSE RESPONSE
         *
         * ***********************************************************************/

        const parsed = parseQuiverResponse(message.content);

        if (!parsed.ok) {
          throw new Error(
            "This should never happen because we parse the response in the handler",
          );
        }

        /* ************************************************************************
         *
         * VALIDATE OUTPUT TYPE
         *
         * ***********************************************************************/

        // TODO, validate the output type

        props.options?.logs?.onValidatedReturn?.(parsed.value);

        /* ************************************************************************
         *
         * RESOLVE
         *
         * ***********************************************************************/

        const response = parsed.value;

        if (!response.ok) {
          props.options?.logs?.onErrorResponse?.(response);

          resolve({
            ok: false,
            request: sent,
            response: message,
            error: {
              code: response.code,
              message: response.message,
              metadata: response.metadata,
            },
          });
        } else {
          props.options?.logs?.onSuccessResponse?.(response);

          resolve({
            ok: true,
            data: response.data,
            request: sent,
            response: message,
            metadata: response.metadata,
          });
        }
      });
    });
  };
};
