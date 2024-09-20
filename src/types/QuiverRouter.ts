import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { Maybe } from "./util/Maybe.js";
import { NewKey } from "./util/NewKey.js";
import { Resolve } from "./util/Resolve.js";
import { SerialExtension } from "./util/SerialExtension.js";

export interface QuiverRouter<
  CtxIn,
  CtxOut,
  Routes extends
    | {
        [key: string]:
          | QuiverMiddleware<CtxOut, any, any, any>
          | QuiverRouter<CtxOut, any, any>;
      }
    | undefined,
> {
  type: "QUIVER_SWITCH";

  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  routes: Routes;

  next: (
    path?: string[],
  ) => Maybe<
    QuiverMiddleware<any, any, any, any> | QuiverRouter<any, any, any>
  >;

  use: <Exec>(
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
    Routes extends undefined
      ? { [key in typeof path]: any }
      : Routes & { [key in typeof path]: any }
  >;
}
