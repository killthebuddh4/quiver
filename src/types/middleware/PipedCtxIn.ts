import { QuiverMiddleware } from "../QuiverMiddleware.js";
import { ComplementCtx } from "./ComplementCtx.js";
import { ResultCtx } from "./ResultCtx.js";

/* Constructs the CtxIn type for the result of lhs.pipe(rhs). It includes all
 * keys in rhs's input that are not provided by lhs. */

export type PipedCtxIn<LhsCtxIn, LhsCtxOut, RhsCtxIn> = ComplementCtx<
  RhsCtxIn,
  ResultCtx<LhsCtxIn, LhsCtxOut>
> &
  LhsCtxIn;
