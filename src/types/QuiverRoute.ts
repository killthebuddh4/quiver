import { QuiverContext } from "./QuiverContext.js";
import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverRoute = {
  match: (context: QuiverContext) => boolean;
  handler: QuiverHandler;
};
