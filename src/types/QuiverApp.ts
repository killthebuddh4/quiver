import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverApp<CtxIn, CtxOut> = {
  middleware: (ctx: CtxIn) => CtxOut | Promise<CtxOut>;
  routes: {
    [key: string]: QuiverFunction<CtxOut> | QuiverApp<CtxOut, any>;
  };
};
