import { QuiverContext } from "../QuiverContext.js";

/* A root context must be less specific than QuiverContext. That is, any root
 * middleware must not depend on any values that aren't provided by the default
 * QuiverContext. */

export type RootCtx<CtxIn> = CtxIn extends undefined
  ? 1
  : QuiverContext extends CtxIn
    ? 1
    : 2;
