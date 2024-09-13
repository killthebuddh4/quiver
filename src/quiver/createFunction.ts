import { Middleware } from "./createMiddleware.js";

export const createFunction = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  middleware: Middleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>,
  fn: (i: any, ctx: CtxOut) => any,
) => {
  return {
    middleware,
    fn,
  };
};
