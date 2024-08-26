import { QuiverContext } from "./QuiverContext.js";
import { QuiverDispatch } from "./QuiverDispatch.js";

export type QuiverHandler = (
  dispatch: QuiverDispatch,
  context: QuiverContext,
) => Promise<void> | void;
