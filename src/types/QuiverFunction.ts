import { QuiverMiddleware } from "./QuiverMiddleware.js";

// TODO We might not need 3 generics here, we maybe (probably) be able to get
// away with 2 or even just 1.

export interface QuiverFunction<
  CtxIn,
  CtxOut,
  Exec extends (i: unknown, ctx: CtxOut) => any,
> {
  type: "QUIVER_FUNCTION";

  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  exec: Exec;
}
