import { QuiverContext } from "./QuiverContext.js";

export type QuiverMiddleware = (
  context: QuiverContext,
) => Promise<QuiverContext>;
