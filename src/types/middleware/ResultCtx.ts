import { ComplementCtx } from "./ComplementCtx.js";

/* Given CtxIn and CtxOut, construct the type of the context that will be
 * provided to the next middleware in a pipeline. */

export type ResultCtx<CtxIn, CtxOut> = CtxOut & ComplementCtx<CtxIn, CtxOut>;
