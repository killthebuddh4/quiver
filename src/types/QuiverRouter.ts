import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { Maybe } from "./util/Maybe.js";
import { NewKey } from "./util/NewKey.js";
import { Resolve } from "./util/Resolve.js";
import { PipeableRoute } from "./pipe/PipeableRoute.js";
import { PipedCtxIn } from "./pipe/PipedCtxIn.js";
import { QuiverFunction } from "./QuiverFunction.js";

export interface QuiverRouter<
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]: QuiverRouter<any, any, any> | QuiverFunction<any, any, any>;
  },
> {
  type: "QUIVER_ROUTER";

  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  routes: Routes;

  next: (
    path: string,
  ) => QuiverFunction<any, any, any> | QuiverRouter<any, any, any> | undefined;

  use: <P extends string, Next>(
    path: keyof Routes extends never ? P : NewKey<Routes>,
    nxt: PipeableRoute<CtxOut, Next>,
  ) => QuiverRouter<
    Resolve<PipedCtxIn<CtxIn, CtxOut, NextCtxIn<Next>>>,
    CtxOut,
    Resolve<
      Routes & {
        [key in typeof path]:
          | QuiverFunction<any, any, any>
          | QuiverRouter<any, any, any>;
      }
    >
  >;
}

type NextCtxIn<Next> =
  Next extends QuiverRouter<infer CtxIn, any, any>
    ? CtxIn
    : Next extends QuiverFunction<infer CtxIn, any, any>
      ? CtxIn
      : never;
