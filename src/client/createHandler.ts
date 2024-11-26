import { Message } from "../types/Message.js";
import { parseQuiverUrl } from "../url/parseQuiverUrl.js";
import { parseQuiverResponse } from "../parsers/parseQuiverResponse.js";
import { QuiverClientOptions } from "../types/QuiverClientOptions.js";
import { QuiverUrl } from "../types/QuiverUrl.js";
import { QuiverClientContext } from "../types/QuiverClientContext.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { QuiverResult } from "../types/QuiverResult.js";

export const createHandler = (props: {
  xmtp: QuiverXmtp;
  server: { address: string };
  pending: Map<string, (response: Message) => any>;
  call: (url: QuiverUrl, args: any[]) => Promise<QuiverResult<unknown>>;
  options?: QuiverClientOptions;
}) => {
  return async (message: Message) => {
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

    if (url.value.channel !== "responses") {
      return;
    }

    received.url = url.value;

    props.options?.logs?.onParsedUrl?.(received.url);

    // TODO I think we need to make sure the message is a response before continuing.

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

    const request = props.pending.get(received.response.id);

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
};
