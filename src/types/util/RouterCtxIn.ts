import { QuiverRouter } from "../QuiverRouter.js";

export type RouterCtxIn<R> =
  R extends QuiverRouter<infer CtxIn, any, any> ? CtxIn : never;
