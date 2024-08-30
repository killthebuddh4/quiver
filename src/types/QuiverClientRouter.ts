import { QuiverContext } from "./QuiverContext.js";
import { QuiverController } from "./QuiverController.js";
import { QuiverClientRoute } from "./QuiverClientRoute.js";
import { QuiverUse } from "./QuiverUse.js";

export type QuiverClientRouter = {
  match: (ctx: QuiverContext) => boolean;
  use: QuiverUse;
  bind: (ctrl: QuiverController) => QuiverClientRoute;
  routes: QuiverClientRoute[];
};
