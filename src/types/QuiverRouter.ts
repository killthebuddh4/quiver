import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { Resolve } from "./util/Resolve.js";
import { PipedCtxIn } from "./middleware/PipedCtxIn.js";
import { RouterCtxIn } from "./router/RouterCtxIn.js";
import { RouteableRoute } from "./router/RouteableRoute.js";
import { InCtx as FnInCtx } from "./function/InCtx.js";
import { RouteableFunction } from "./router/RouteableFunction.js";
import { InCtx } from "./middleware/InCtx.js";
import { OutCtx } from "./middleware/OutCtx.js";

export interface QuiverRouter<
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]:
      | QuiverRouter<any, any, any>
      | QuiverFunction<any>
      | undefined;
  },
> {
  type: "QUIVER_ROUTER";

  mw: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  routes: Routes;

  route: (
    path: string,
  ) => QuiverRouter<any, any, any> | QuiverFunction<any> | undefined;

  router: <P extends string, Route>(
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

  function: <P extends string, Route extends QuiverFunction<any>>(
    path: P,
    route: RouteableFunction<QuiverRouter<CtxIn, CtxOut, any>, Route>,
  ) => QuiverRouter<
    Resolve<PipedCtxIn<CtxIn, CtxOut, FnInCtx<Route>>>,
    CtxOut,
    Resolve<
      Routes & {
        [key in P]: Route;
      }
    >
  >;

  middleware: <Mw extends QuiverMiddleware<any, any, any, any>>(
    mw: Mw,
  ) => QuiverRouter<InCtx<Mw>, OutCtx<Mw>, Routes>;
}
