import { QuiverMiddleware } from "../quiver/createMiddleware.js";

export type QuiverFunction<CtxIn, CtxOut, CtxExitIn, CtxExitOut> = {
  middleware?: QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>;
  fn: (i: any, ctx: CtxOut) => any;
};
