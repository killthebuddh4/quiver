import { QuiverContext } from "./QuiverContext.js";
import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverRoute = {
  match: (context: QuiverContext) => boolean;
  function: QuiverFunction<unknown, unknown>;
};
