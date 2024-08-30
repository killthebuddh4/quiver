import { QuiverMatch } from "./QuiverMatch.js";
import { QuiverUse } from "./QuiverUse.js";
import { QuiverRoute } from "./QuiverRoute.js";

export type QuiverRouter = {
  match: QuiverMatch;
  use: QuiverUse;
  bind: (use: QuiverUse) => QuiverRouter;
  routes: QuiverRoute[];
};
