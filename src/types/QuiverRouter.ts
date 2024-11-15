import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { Resolve } from "./util/Resolve.js";
import { PipedCtxIn } from "./middleware/PipedCtxIn.js";
import { RouterCtxIn } from "./util/RouterCtxIn.js";
import { RouteableRoute } from "./router/RouteableRoute.js";
import { FunctionCtxIn } from "./router/FunctionCtxIn.js";
import { RouteableFunction } from "./router/RouteableFunction.js";

export interface QuiverRouter<
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]:
      | QuiverRouter<any, any, any>
      | QuiverFunction<any, any, any>
      | undefined;
  },
> {
  type: "QUIVER_ROUTER";

  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  routes: Routes;

  next: (
    path: string,
  ) => QuiverRouter<any, any, any> | QuiverFunction<any, any, any> | undefined;

  use: <P extends string, Route>(
    path: P,
    route: RouteableRoute<QuiverRouter<CtxIn, CtxOut, any>, Route>,
  ) => QuiverRouter<
    Resolve<PipedCtxIn<CtxIn, CtxOut, RouterCtxIn<Route>>>,
    CtxOut,
    Resolve<
      Routes & {
        [key in P]: Route;
      }
    >
  >;

  bind: <P extends string, Route>(
    path: P,
    route: RouteableFunction<QuiverRouter<CtxIn, CtxOut, any>, Route>,
  ) => QuiverRouter<
    Resolve<PipedCtxIn<CtxIn, CtxOut, FunctionCtxIn<Route>>>,
    CtxOut,
    Resolve<
      Routes & {
        [key in P]: Route;
      }
    >
  >;

  listen: (namespace: string) => { stop: () => void };
}
