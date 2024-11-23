import { QuiverMiddleware } from "../QuiverMiddleware.js";
import { PipeableCtx } from "../middleware/PipeableCtx.js";
import { ResultCtx } from "../middleware/ResultCtx.js";

/* Returns Fn if Fn is compatible with Mw, otherwise never. */

export type DeriveableFn<Mw, Fn> =
  Mw extends QuiverMiddleware<infer MwCtxIn, infer MwCtxOut, any, any>
    ? Fn extends (...args: infer Args) => any
      ? PipeableCtx<ResultCtx<MwCtxIn, MwCtxOut>, Args[1]> extends 1
        ? Fn
        : never
      : never
    : never;
