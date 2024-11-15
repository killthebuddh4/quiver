import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { Resolve } from "./util/Resolve.js";
import { PipedCtxIn } from "./middleware/PipedCtxIn.js";
import { RouterCtxIn } from "./util/RouterCtxIn.js";
import { RouteableRoute } from "./router/RouteableRoute.js";

export interface QuiverRouter<
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]: QuiverRouter<any, any, any> | undefined;
  },
> {
  type: "QUIVER_ROUTER";

  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  routes: Routes;

  next: (path: string) => QuiverRouter<any, any, any> | undefined;

  use: <Route>(
    path: string,
    route: RouteableRoute<QuiverRouter<CtxIn, CtxOut, any>, Route>,
  ) => QuiverRouter<
    Resolve<PipedCtxIn<CtxIn, CtxOut, RouterCtxIn<Route>>>,
    CtxOut,
    Resolve<{
      [key in keyof Routes | typeof path]:
        | QuiverRouter<any, any, any>
        | undefined;
    }>
  >;
}
