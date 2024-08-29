import { QuiverController } from "./QuiverController.js";
import { QuiverRoute } from "./QuiverRoute.js";
import { QuiverUse } from "./QuiverUse.js";

export type QuiverRouter = {
  use: QuiverUse;
  bind: (ctrl: QuiverController) => QuiverRoute;
};
