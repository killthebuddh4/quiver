import { QuiverPipeline } from "../QuiverPipeline.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { Maybe } from "../util/Maybe.js";
import { QuiverApp } from "./QuiverApp.js";
import { QuiverContext } from "./QuiverContext.js";

export interface QuiverFunction<
  CtxIn,
  CtxOut,
  Exec extends (...args: any[]) => any,
> {
  type: "QUIVER_FUNCTION";

  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  route: () => Maybe<(i: any, ctx: any) => any>;

  compile: () => QuiverPipeline[];

  exec: Exec;

  app: (namespace: string) => CtxIn extends QuiverContext ? QuiverApp : never;
}
