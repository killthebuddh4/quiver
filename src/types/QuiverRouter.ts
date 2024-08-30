import { QuiverContext } from "./QuiverContext.js";
import { QuiverController } from "./QuiverController.js";
import { QuiverRoute } from "./QuiverRoute.js";
import { QuiverUse } from "./QuiverUse.js";

export type QuiverRouter = {
  match: (ctx: QuiverContext) => boolean;
  use: QuiverUse;
  bind: (ctrl: QuiverController) => QuiverRoute;
  routes: QuiverRoute[];
};
