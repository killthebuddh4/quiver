import { QuiverMiddleware } from "./createMiddleware.js";

export const createFunction = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  middleware: QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>,
  fn: (i: any, ctx: CtxOut) => any,
) => {
  return {
    middleware,
    fn,
  };
};
