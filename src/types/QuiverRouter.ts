import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverRouter<CtxIn, CtxOut> = {
  use: (ctx: CtxIn) => CtxOut | Promise<CtxOut>;
  exit: (ctx: any) => any;
  routes: {
    [key: string]: QuiverFunction<CtxOut, any> | QuiverRouter<CtxOut, any>;
  };
};
