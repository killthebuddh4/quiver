import { QuiverMiddleware } from "../QuiverMiddleware.js";

export type MwCtxIn<Mw> =
  Mw extends QuiverMiddleware<infer CtxIn, any, any, any> ? CtxIn : never;
