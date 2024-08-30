import { QuiverClientResolve } from "./QuiverClientResolve.js";
import { QuiverContext } from "./QuiverContext.js";
import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverClientRoute = {
  match: (context: QuiverContext) => boolean;
  function: QuiverFunction<unknown, unknown>;
  resolve: QuiverClientResolve;
};
