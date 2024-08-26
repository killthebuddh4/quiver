import { QuiverHandler } from "./QuiverHandler.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverCall } from "./QuiverCall.js";

export type Quiver = {
  start: () => Promise<() => void>;
  stop: () => void;
  router: (router: QuiverRouter) => void;
  client: (client: {
    bind: (call: QuiverCall) => {
      address: string;
      namespace: string;
      handler: QuiverHandler;
    };
  }) => void;
};
