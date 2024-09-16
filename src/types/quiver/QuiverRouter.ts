import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverPipeline } from "../QuiverPipeline.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverContext } from "./QuiverContext.js";
import { QuiverApp } from "./QuiverApp.js";

export interface QuiverRouter<
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]:
      | QuiverFunction<CtxOut, any, any>
      | QuiverRouter<CtxOut, any, any>;
  },
> {
  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  routes: Routes;

  compile: (path?: string[]) => QuiverPipeline[];

  app: () => CtxIn extends QuiverContext
    ? QuiverApp<QuiverRouter<CtxIn, CtxOut, Routes>>
    : never;
}
