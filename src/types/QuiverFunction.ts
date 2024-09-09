import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverFunction<CtxIn, CtxExitOut> = {
  middleware: QuiverMiddleware<CtxIn, CtxExitOut>;
  fn: (i: any, ctx: any) => any;
};
