import { QuiverUrl } from "./QuiverUrl.js";
import { QuiverUse } from "./QuiverUse.js";
import { QuiverRoute } from "./QuiverRoute.js";

export type QuiverRouter = {
  path: QuiverUrl;
  use: QuiverUse;
  bind: (use: QuiverUse) => QuiverRouter;
  routes: QuiverRoute[];
};
