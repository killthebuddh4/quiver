import { QuiverFunction } from "../QuiverFunction.js";

export type FunctionCtxIn<F> =
  F extends QuiverFunction<infer CtxIn, any, any> ? CtxIn : never;
