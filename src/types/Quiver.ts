import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverCall } from "./QuiverCall.js";
import { QuiverClientHandler } from "./QuiverClientHandler.js";

export type Quiver = {
  start: () => Promise<() => void>;
  stop: () => void;
  router: (router: QuiverRouter) => void;
  // client should be a QuiverClient type, but my TypeScript-fu is not strong enough
  client: (client: {
    bind: (call: QuiverCall) => {
      address: string;
      namespace: string;
      handler: QuiverClientHandler;
    };
  }) => void;
};
