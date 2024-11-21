import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { createHandler } from "./createHandler.js";

export const serve = (
  xmtp: QuiverXmtp,
  root: QuiverRouter<any, any, any> | QuiverFunction<any>,
) => {
  const handler = createHandler(xmtp, root);

  const sub = xmtp.subscribe(handler);

  return () => {
    sub.then((s) => {
      console.log(`unsubscribing from xmtp with address ${xmtp.address}`);
      s.unsubscribe();
    });
  };
};
