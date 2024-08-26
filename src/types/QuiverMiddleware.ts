import { QuiverContext } from "./QuiverContext.js";
import { QuiverDispatch } from "./QuiverDispatch.js";

export type QuiverMiddleware = (
  dispatch: QuiverDispatch,
  context: QuiverContext,
) => Promise<QuiverContext> | QuiverContext;
