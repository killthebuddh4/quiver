import { QuiverFunction } from "../types/QuiverFunction.js";

export const createFunction = <
  CtxIn,
  CtxOut,
  Func extends (i: any, ctx: CtxIn) => { o: any; ctx: CtxOut },
>(
  func: Func,
): QuiverFunction<CtxIn, CtxOut, Func> => {
  const type = "QUIVER_FUNCTION" as const;

  return { type, func };
};
