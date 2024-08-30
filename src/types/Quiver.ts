import { QuiverController } from "./QuiverController.js";
import { QuiverUse } from "./QuiverUse.js";
import { QuiverClientRouter } from "./QuiverClientRouter.js";
import { QuiverRouter } from "./QuiverRouter.js";

export type Quiver = {
  use: QuiverUse;
  start: () => Promise<() => void>;
  stop: () => void;
  router: (router: { bind: (use: QuiverUse) => QuiverRouter }) => void;
  // client should be a QuiverClient type, but my TypeScript-fu is not strong enough
  client: (client: {
    bind: (use: QuiverUse, ctrl: QuiverController) => QuiverClientRouter;
  }) => void;
};
