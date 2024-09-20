import { ParallelExtension } from "./util/ParallelExtension.js";
import { SerialExtension } from "./util/SerialExtension.js";
import { Resolve } from "./util/Resolve.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverRouter } from "./QuiverRouter.js";

export interface QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  extend: <Exec>(
    exec: ParallelExtension<CtxIn, CtxOut, Exec>,
  ) => QuiverMiddleware<
    Resolve<
      Exec extends (ctx: infer I) => any
        ? CtxIn extends undefined
          ? I
          : I & CtxIn
        : never
    >,
    Resolve<Exec extends (ctx: infer I) => infer O ? I & O & CtxOut : never>,
    CtxExitIn,
    CtxExitOut
  >;

  pipe: <Exec>(
    exec: SerialExtension<CtxOut, Exec>,
  ) => QuiverMiddleware<
    Resolve<
      Exec extends (ctx: infer I) => any
        ? CtxIn extends undefined
          ? Omit<I, keyof CtxOut>
          : Omit<I, keyof CtxIn> & CtxIn
        : never
    >,
    Resolve<Exec extends (ctx: any) => infer O ? O & CtxOut : never>,
    CtxExitIn,
    CtxExitOut
  >;

  exec: (ctx: CtxIn) => CtxOut;

  function: <Exec extends (i: any, ctx: CtxOut) => any>(
    exec: Exec,
  ) => QuiverFunction<CtxIn, CtxOut, Exec>;

  router: <
    R extends {
      [key: string]:
        | QuiverRouter<CtxOut | undefined, any, any>
        | QuiverFunction<CtxOut | undefined, any, any>;
    },
  >(
    routes: R,
  ) => QuiverRouter<CtxIn, CtxOut, R>;
}
