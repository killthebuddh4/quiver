import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverServerOptions } from "../types/QuiverServerOptions.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { createServer } from "./createServer.js";

export const serve = (
  xmtp: QuiverXmtp,
  root: QuiverRouter<any, any, any> | QuiverFunction<any>,
  options?: QuiverServerOptions,
) => {
  const server = createServer(xmtp, root, options);

  const sub = xmtp.subscribe(server);

  return () => {
    sub.then((s) => {
      console.log(`unsubscribing from xmtp with address ${xmtp.address}`);
      s.unsubscribe();
    });
  };
};
