import { Message } from "../types/Message.js";
import { parseQuiverUrl } from "../url/parseQuiverUrl.js";
import { parseQuiverResponse } from "../parsers/parseQuiverResponse.js";
import { QuiverClientOptions } from "../types/QuiverClientOptions.js";
import { getRequestUrl } from "../url/getRequestUrl.js";
import { QuiverUrl } from "../types/QuiverUrl.js";
import { urlToString } from "../url/urlToString.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverClient } from "../types/QuiverClient.js";
import { QuiverClientContext } from "../types/QuiverClientContext.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { QuiverResult } from "../types/QuiverResult.js";

export const createClient = <
  Router extends QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
>(props: {
  xmtp: QuiverXmtp;
  server: { address: string; namespace: string };
  options?: QuiverClientOptions;
}): QuiverClient<Router> => {
  const pending = new Map<string, (response: Message) => any>();

  const call = async (
    url: QuiverUrl,
    args: any[],
  ): Promise<QuiverResult<unknown>> => {
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

      await props.xmtp.start();

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
        pending.delete(sent.id);

        resolve({
          ok: false,
          error: {
            code: "REQUEST_TIMEOUT",
            message: `Timed out after ${props.options?.timeoutMs || 10000}ms`,
          },
        });
      }, props.options?.timeoutMs || 10000);

      pending.set(sent.id, (message: Message) => {
        /* ************************************************************************
         *
         * RECV RESPONSE
         *
         * ***********************************************************************/

        props.options?.logs?.onMatchedRequest?.(message);

        clearTimeout(timeout);
        pending.delete(sent.id);

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

  const proxy = (url: QuiverUrl) => {
    return new Proxy(() => null, {
      get: (_1, prop) => {
        if (typeof prop !== "string") {
          throw new Error(`Expected string, got ${typeof prop}`);
        }

        url.path.push(prop);

        return proxy(url);
      },

      apply: (_1, _2, args) => {
        return call(url, args);
      },
    });
  };

  const handler = async (message: Message) => {
    /* ************************************************************************
     *
     * RECV_MESSAGE
     *
     * ***********************************************************************/

    props.options?.logs?.onRecvMessage?.(message);

    let received: QuiverClientContext = {
      message,
    };

    /* ************************************************************************
     *
     * PARSE_URL
     *
     * ***********************************************************************/

    const url = parseQuiverUrl(received.message);

    if (!url.ok) {
      props.options?.logs?.onParseUrlError?.(received.message, url);

      return;
    }

    received.url = url.value;

    if (received.url.namespace !== props.server.namespace) {
      props.options?.logs?.onNamespaceMismatch?.(
        received.message,
        received.url.namespace,
      );

      return;
    }

    props.options?.logs?.onParsedUrl?.(received.url);

    /* ************************************************************************
     *
     * PARSE_JSON
     *
     * ***********************************************************************/

    try {
      received.json = JSON.parse(String(received.message.content));
    } catch (error) {
      props.options?.logs?.onParseJsonError?.(received.message, error);

      return;
    }

    props.options?.logs?.onParsedJson?.(received.json);

    /* ************************************************************************
     *
     * PARSE_RESPONSE
     *
     * ************************************************************************/

    const response = parseQuiverResponse(received.json);

    if (!response.ok) {
      props.options?.logs?.onParseResponseError?.(received.message, response);

      return;
    }

    received.response = response.value;

    props.options?.logs?.onParsedResponse?.(received.response);

    /* ************************************************************************
     *
     * GET_REQUEST
     *
     * ***********************************************************************/

    const request = pending.get(received.response.id);

    if (request === undefined) {
      props.options?.logs?.onRequestNotFound?.(received.response);

      return;
    }

    /* ************************************************************************
     *
     * MIDDLEWARE
     *
     * ***********************************************************************/

    // TODO

    /* ************************************************************************
     *
     * RESOLVE REQUEST
     *
     * ***********************************************************************/

    request(received.message);
  };

  // TODO, should we create a subscription for each call? Maybe? That would give
  // us a way to unsubscribe.

  props.xmtp.subscribe(handler);

  return proxy(
    getRequestUrl(props.xmtp.signer.address, props.server.namespace, []),
  ) as unknown as QuiverClient<Router>;
};
