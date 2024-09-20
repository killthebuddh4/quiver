import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverFunction } from "../types/QuiverFunction.js";

export const createFunction = <
  CtxIn,
  CtxOut,
  Exec extends (i: any, ctx: CtxOut) => any,
>(
  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>,
  exec: Exec,
): QuiverFunction<CtxIn, CtxOut, Exec> => {
  const type = "QUIVER_FUNCTION" as const;

  return { type, middleware, exec };
};
