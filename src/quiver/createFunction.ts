import { QuiverFunction } from "../types/QuiverFunction.js";
import { InCtx } from "../types/function/InCtx.js";

export const createFunction = <Func extends (i: any, ctx: any) => any>(
  func: Func,
): QuiverFunction<InCtx<Func>, Func> => {
  const type = "QUIVER_FUNCTION" as const;

  return { type, func };
};
