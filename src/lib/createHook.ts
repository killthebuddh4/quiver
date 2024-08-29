import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverHook } from "../types/QuiverHook.js";

export const createHook = (
  name: string,
  handler: QuiverMiddleware,
): QuiverHook => {
  return {
    name,
    before: [],
    mw: handler,
    throw: [],
    return: [],
    exit: [],
    after: [],
  };
};
