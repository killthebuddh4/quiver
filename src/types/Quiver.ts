import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverCall } from "./QuiverCall.js";
import { QuiverHandler } from "./QuiverHandler.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type Quiver = {
  use: (mw: QuiverMiddleware) => void;
  start: () => Promise<() => void>;
  stop: () => void;
  router: (router: QuiverRouter) => void;
  // client should be a QuiverClient type, but my TypeScript-fu is not strong enough
  client: (client: {
    bind: (call: QuiverCall) => {
      address: string;
      namespace: string;
      handler: QuiverHandler;
    };
  }) => void;
};
