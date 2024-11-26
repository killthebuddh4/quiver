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
import { createFetch } from "./createFetch.js";
import { createProxy } from "./createProxy.js";
import { createHandler } from "./createHandler.js";

export const createClient = <
  Router extends QuiverRouter<any, any, any> | QuiverFunction<any>,
>(props: {
  xmtp: QuiverXmtp;
  server: { address: string };
  options?: QuiverClientOptions;
}): QuiverClient<Router> => {
  const pending = new Map<string, (response: Message) => any>();

  const call = createFetch({
    xmtp: props.xmtp,
    server: props.server,
    pending,
    options: props.options,
  });

  const handler = createHandler({
    xmtp: props.xmtp,
    server: props.server,
    pending,
    call,
    options: props.options,
  });

  props.xmtp.subscribe(handler);

  return createProxy(
    getRequestUrl(props.xmtp.signer.address, []),
    call,
  ) as unknown as QuiverClient<Router>;
};
