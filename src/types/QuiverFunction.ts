import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { Maybe } from "./util/Maybe.js";
import { QuiverApp } from "./QuiverApp.js";
import { QuiverContext } from "./QuiverContext.js";
import { QuiverAppOptions } from "./QuiverAppOptions.js";

// TODO We might not need 3 generics here, we maybe (probably) be able to get
// away with 2 or even just 1.

export interface QuiverFunction<
  CtxIn,
  CtxOut,
  Exec extends (i: unknown, ctx: CtxOut) => any,
> {
  type: "QUIVER_FUNCTION";

  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  route: () => Maybe<(i: any, ctx: any) => any>;

  compile: () => QuiverMiddleware<any, any, any, any>[];

  exec: Exec;

  app: (
    namespace: string,
    options?: QuiverAppOptions,
  ) => CtxIn extends QuiverContext | undefined
    ? QuiverApp<QuiverFunction<CtxIn, CtxOut, Exec>>
    : never;
}
