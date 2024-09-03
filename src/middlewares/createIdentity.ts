import { QuiverContext } from "../types/QuiverContext.js";
import { middleware } from "../createMiddleware.js";

export const createIdentity = () => {
  return middleware(async (context: QuiverContext) => {
    return context;
  });
};
