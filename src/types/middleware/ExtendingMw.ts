import { QuiverMiddleware } from "../QuiverMiddleware.js";
import { DisjointCtx } from "./DisjointCtx.js";
import { SatisfiableCtx } from "./SatisfiableCtx.js";

/* Returns Rhs if it can extend the Lhs (i.e. lhs.extend(rhs) is valid). This is
 * the case whenever the written keys of both middlewares are disjoint and the
 * intersection of the read keys of both middlewares is satisfiable. */

export type ExtendingMw<Lhs, Rhs> =
  Lhs extends QuiverMiddleware<infer LhsCtxIn, infer LhsCtxOut, any, any>
    ? Rhs extends QuiverMiddleware<infer RhsCtxIn, infer RhsCtxOut, any, any>
      ? DisjointCtx<LhsCtxOut, RhsCtxOut> extends 1
        ? SatisfiableCtx<LhsCtxIn, RhsCtxIn> extends 1
          ? Rhs
          : never
        : never
      : never
    : never;
