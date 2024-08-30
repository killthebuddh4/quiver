import { QuiverClientResolve } from "./QuiverClientResolve.js";
import { QuiverContext } from "./QuiverContext.js";

export type QuiverClientRoute = {
  match: (context: QuiverContext) => boolean;
  resolve: QuiverClientResolve;
};
