import { QuiverHandler } from "./QuiverHandler.js";
import { QuiverRouter } from "./QuiverRouter.js";

export type Quiver = {
  start: () => Promise<() => void>;
  stop: () => void;
  router: (router: QuiverRouter) => void;
  client: (c: {
    bind: () => {
      address: string;
      namespace: string;
      handler: QuiverHandler;
    };
  }) => void;
};
