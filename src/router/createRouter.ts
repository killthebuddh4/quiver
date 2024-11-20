import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { Resolve } from "../types/util/Resolve.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { PipedCtxIn } from "../types/middleware/PipedCtxIn.js";
import { RouterCtxIn } from "../types/router/RouterCtxIn.js";
import { RouteableRoute } from "../types/router/RouteableRoute.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { RouteableFunction } from "../types/router/RouteableFunction.js";
import { InCtx as FnInCtx } from "../types/function/InCtx.js";
import { InCtx as MwInCtx } from "../types/middleware/InCtx.js";
import { OutCtx as MwOutCtx } from "../types/middleware/OutCtx.js";

export const createRouter = <
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]:
      | QuiverRouter<any, any, any>
      | QuiverFunction<any>
      | undefined;
  },
>(
  xmtp: QuiverXmtp,
  mw: QuiverMiddleware<CtxIn, CtxOut, any, any>,
  routes: Routes,
): QuiverRouter<CtxIn, CtxOut, Routes> => {
  const type = "QUIVER_ROUTER" as const;

  const route = (path: string) => {
    return routes[path];
  };

  const useMiddleware = <Mw extends QuiverMiddleware<any, any, any, any>>(
    mw: Mw,
  ) => {
    return createRouter<MwInCtx<Mw>, MwOutCtx<Mw>, Routes>(
      xmtp,
      mw,
      routes,
    ) as any;
  };

  const useRouter = <P extends string, R>(
    path: P,
    router: RouteableRoute<QuiverRouter<CtxIn, CtxOut, any>, R>,
  ) => {
    return createRouter<
      Resolve<PipedCtxIn<CtxIn, CtxOut, RouterCtxIn<R>>>,
      CtxOut,
      Routes & { [key in P]: R }
    >(
      xmtp,
      mw as any,
      {
        ...(routes || {}),
        [path]: router,
      } as any,
    ) as any;
  };

  const useFunction = <P extends string, R extends QuiverFunction<any>>(
    path: P,
    route: RouteableFunction<QuiverRouter<CtxIn, CtxOut, any>, R>,
  ) => {
    return createRouter<
      Resolve<PipedCtxIn<CtxIn, CtxOut, FnInCtx<R>>>,
      CtxOut,
      Routes & { [key in P]: R }
    >(
      xmtp,
      mw as any,
      {
        ...(routes || {}),
        [path]: route,
      } as any,
    ) as any;
  };

  return {
    type,
    mw: mw,
    routes,
    route,
    router: useRouter,
    function: useFunction,
    middleware: useMiddleware,
  };
};
