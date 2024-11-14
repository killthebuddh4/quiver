import { QuiverMiddleware } from "../QuiverMiddleware.js";

export type OutCtx<Mw> =
  Mw extends QuiverMiddleware<any, infer O, any, any> ? O : never;
