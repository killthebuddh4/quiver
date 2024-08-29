import { QuiverContext } from "./QuiverContext.js";
import { QuiverController } from "./QuiverController.js";

export type QuiverHandler = (
  context: QuiverContext,
  controller: QuiverController,
) => Promise<QuiverContext> | QuiverContext;
