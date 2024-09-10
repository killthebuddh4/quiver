import { QuiverMiddleware } from "./createMiddleware.js";

export const createFunction = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  middleware?: QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>,
) => {
  return <I, O>(fn: (i: I, ctx: CtxOut) => O) => {
    return {
      middleware,
      fn,
    };
  };
};
