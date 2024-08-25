import { QuiverHandler } from "./QuiverHandler.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { Fig } from "./Fig.js";

export type Quiver = {
  start: () => Promise<() => void>;
  stop: () => void;
  router: (router: QuiverRouter) => void;
  client: (c: {
    bind: (publish: Fig["publish"]) => {
      address: string;
      namespace: string;
      handler: QuiverHandler;
    };
  }) => void;
};
