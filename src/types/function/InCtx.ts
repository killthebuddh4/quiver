import { QuiverFunction } from "../QuiverFunction.js";

export type InCtx<F> =
  F extends QuiverFunction<infer CtxIn, any> ? CtxIn : never;
