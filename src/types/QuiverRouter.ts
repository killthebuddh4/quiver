import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { Maybe } from "./util/Maybe.js";
import { QuiverContext } from "./QuiverContext.js";
import { QuiverApp } from "./QuiverApp.js";
import { QuiverAppOptions } from "./QuiverAppOptions.js";
import { NewKey } from "./util/NewKey.js";
import { Resolve } from "./util/Resolve.js";
import { SerialExtension } from "./util/SerialExtension.js";

export interface QuiverRouter<
  CtxIn,
  CtxOut,
  Routes extends
    | {
        [key: string]:
          | QuiverFunction<CtxOut, any, any>
          | QuiverRouter<CtxOut, any, any>;
      }
    | undefined,
> {
  type: "QUIVER_ROUTER";

  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  routes: Routes;

  route: (path: string[]) => Maybe<(i: any, ctx: any) => any>;

  compile: (path?: string[]) => QuiverMiddleware<any, any, any, any>[];

  pipe: <Exec>(
    path: Routes extends undefined ? string : NewKey<Routes>,
    exec: SerialExtension<CtxOut, Exec>,
  ) => QuiverRouter<
    Resolve<
      Exec extends (ctx: infer I) => any
        ? CtxIn extends undefined
          ? Omit<I, keyof CtxOut>
          : Omit<I, keyof CtxIn> & CtxIn
        : never
    >,
    Resolve<Exec extends (ctx: any) => infer O ? O & CtxOut : never>,
    Routes & { [key in string]: Exec }
  >;

  app: (
    namespace: string,
    options?: QuiverAppOptions,
  ) => CtxIn extends QuiverContext
    ? QuiverApp<QuiverRouter<CtxIn, CtxOut, Routes>>
    : never;
}
