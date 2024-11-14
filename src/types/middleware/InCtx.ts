import { QuiverMiddleware } from "../QuiverMiddleware.js";

export type InCtx<Mw> =
  Mw extends QuiverMiddleware<infer I, any, any, any> ? I : never;
