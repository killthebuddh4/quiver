import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { createHandler } from "../quiver/createHandler.js";

export const serve = (
  namespace: string,
  xmtp: QuiverXmtp,
  router: QuiverRouter<any, any, any>,
) => {
  const handler = createHandler(namespace, xmtp, router);

  const sub = xmtp.subscribe(handler);

  return () => {
    sub.then((s) => s.unsubscribe());
  };
};
