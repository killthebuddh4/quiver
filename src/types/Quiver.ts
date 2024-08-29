import { QuiverController } from "./QuiverController.js";
import { QuiverRoute } from "./QuiverRoute.js";
import { QuiverUse } from "./QuiverUse.js";

export type Quiver = {
  use: QuiverUse;
  start: () => Promise<() => void>;
  stop: () => void;
  router: (router: {
    bind: (controller: QuiverController) => QuiverRoute;
  }) => void;
  // client should be a QuiverClient type, but my TypeScript-fu is not strong enough
  client: (client: {
    bind: (controller: QuiverController) => QuiverRoute;
  }) => void;
};
