import { QuiverController } from "./QuiverController.js";
import { QuiverRoute } from "./QuiverRoute.js";

export type QuiverRouter = {
  bind: (ctrl: QuiverController) => QuiverRoute;
};
