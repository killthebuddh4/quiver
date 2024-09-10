import { QuiverMiddleware } from "./createMiddleware.js";
import { QuiverContext } from "../types/QuiverContext.js";

export const createFunction = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  middleware?: QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>,
) => {
  return <I, O>(fn: (i: I, ctx: QuiverContext & CtxOut) => O) => {
    return {
      middleware,
      fn,
    };
  };
};
