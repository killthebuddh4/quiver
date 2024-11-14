import { ComplementCtx } from "./ComplementCtx.js";

/* Constructs the CtxOut type for the result of lhs.pipe(rhs). It includes all
 * the keys that are written by rhs plus all the keys that are written by lhs and
 * not by rhs. */

export type PipedCtxOut<LhsCtxOut, RhsCtxOut> = ComplementCtx<
  LhsCtxOut,
  RhsCtxOut
> &
  RhsCtxOut;
