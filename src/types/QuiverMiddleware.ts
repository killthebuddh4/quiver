import { QuiverContext } from "./QuiverContext.js";

export type QuiverMiddleware = {
  name: string;
  handler: (context: QuiverContext) => Promise<QuiverContext> | QuiverContext;
};
