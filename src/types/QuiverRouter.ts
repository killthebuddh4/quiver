import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverRouter<CtxIn, CtxOut, CtxExitIn, CtxExitOut> = {
  middleware: QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>;
  routes: {
    [key: string]:
      | QuiverFunction<CtxOut, any, any, any>
      | QuiverRouter<CtxOut, any, any, any>;
  };
};
