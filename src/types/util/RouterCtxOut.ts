import { QuiverRouter } from "../QuiverRouter.js";

export type RouterCtxOut<R> =
  R extends QuiverRouter<any, infer CtxOut, any> ? CtxOut : never;
