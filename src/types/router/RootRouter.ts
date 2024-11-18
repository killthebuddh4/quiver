import { QuiverRouter } from "../QuiverRouter.js";
import { RootCtx } from "../middleware/RootCtx.js";

/* A root router is a router whose input context is a root context. A root
 * context is one that doesn't have any dependencies beyond the default
 * QuiverContext. */

export type RootRouter<Router> =
  Router extends QuiverRouter<infer CtxIn, any, any>
    ? RootCtx<CtxIn> extends 1
      ? Router
      : never
    : never;
