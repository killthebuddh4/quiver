import { QuiverMiddleware } from "../QuiverMiddleware.js";
import { RemainderCtx } from "./RemainderCtx.js";
import { ResultCtx } from "./ResultCtx.js";
import { ComposedCtx } from "./ComposedCtx.js";

/* Constructs the CtxIn type for the result of lhs.pipe(rhs). It includes all
 * keys in rhs's input that are not provided by lhs. */

export type PipedCtxIn<LhsCtxIn, LhsCtxOut, RhsCtxIn> = ComposedCtx<
  RemainderCtx<RhsCtxIn, ResultCtx<LhsCtxIn, LhsCtxOut>>,
  LhsCtxIn
>;
