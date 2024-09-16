import { QuiverPipeline } from "../QuiverPipeline.js";
import { QuiverApp } from "./QuiverApp.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverContext } from "./QuiverContext.js";

export interface QuiverFunction<
  CtxIn,
  CtxOut,
  Exec extends (...args: any[]) => any,
> {
  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  compile: () => QuiverPipeline[];

  exec: Exec;

  app: () => CtxIn extends QuiverContext
    ? QuiverApp<QuiverFunction<CtxIn, CtxOut, Exec>>
    : never;
}
