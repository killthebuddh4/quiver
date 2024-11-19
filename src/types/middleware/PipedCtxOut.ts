import { RemainderCtx } from "./RemainderCtx.js";
import { ComposedCtx } from "./ComposedCtx.js";

/* Constructs the CtxOut type for the result of lhs.pipe(rhs). It includes all
 * the keys that are written by rhs plus all the keys that are written by lhs and
 * not by rhs. */

export type PipedCtxOut<LhsCtxOut, RhsCtxOut> = ComposedCtx<
  RemainderCtx<LhsCtxOut, RhsCtxOut>,
  RhsCtxOut
>;
