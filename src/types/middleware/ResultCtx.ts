import { RemainderCtx } from "./RemainderCtx.js";
import { ComposedCtx } from "./ComposedCtx.js";

/* Given CtxIn and CtxOut, construct the type of the context that will be
 * provided to the next middleware in a pipeline. */

export type ResultCtx<CtxIn, CtxOut> = CtxIn extends undefined
  ? CtxOut
  : CtxOut extends undefined
    ? CtxIn
    : ComposedCtx<CtxOut, RemainderCtx<CtxIn, CtxOut>>;
