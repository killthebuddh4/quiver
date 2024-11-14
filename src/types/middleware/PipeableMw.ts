import { QuiverMiddleware } from "../QuiverMiddleware.js";
import { PipeableCtx } from "./PipeableCtx.js";
import { ResultCtx } from "./ResultCtx.js";

/* Returns Rhs if Lhs can be piped to Rhs, otherwise never. */

export type PipeableMw<Lhs, Rhs> =
  Lhs extends QuiverMiddleware<infer LhsCtxIn, infer LhsCtxOut, any, any>
    ? Rhs extends QuiverMiddleware<infer RhsCtxIn, any, any, any>
      ? PipeableCtx<ResultCtx<LhsCtxIn, LhsCtxOut>, RhsCtxIn> extends 1
        ? Rhs
        : never
      : never
    : never;
