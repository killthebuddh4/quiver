import { QuiverMiddleware } from "../QuiverMiddleware.js";

export type MwCtxOut<Mw> =
  Mw extends QuiverMiddleware<any, infer CtxOut, any, any> ? CtxOut : never;
