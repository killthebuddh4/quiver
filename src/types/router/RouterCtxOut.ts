import { QuiverRouter } from "../QuiverRouter.js";

export type RouterCtxIn<R> =
  R extends QuiverRouter<any, infer CtxOut, any> ? CtxOut : never;
