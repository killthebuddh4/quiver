import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { Resolve } from "../types/util/Resolve.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { PipedCtxIn } from "../types/middleware/PipedCtxIn.js";
import { RouterCtxIn } from "../types/util/RouterCtxIn.js";
import { RouteableRoute } from "../types/router/RouteableRoute.js";

export const createRouter = <
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]: QuiverRouter<any, any, any> | undefined;
  },
>(
  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>,
  routes: Routes,
): QuiverRouter<CtxIn, CtxOut, Routes> => {
  const type = "QUIVER_ROUTER" as const;

  const next = (path: string) => {
    return routes[path];
  };

  const use = <R>(
    path: string,
    route: RouteableRoute<QuiverRouter<CtxIn, CtxOut, any>, R>,
  ) => {
    return createRouter<
      Resolve<PipedCtxIn<CtxIn, CtxOut, RouterCtxIn<R>>>,
      CtxOut,
      {
        [key in keyof Routes | typeof path]:
          | QuiverRouter<any, any, any>
          | undefined;
      }
    >(
      middleware as any,
      {
        ...(routes || {}),
        [path]: route,
      } as any,
    ) as any;
  };

  return { type, middleware, routes, next, use };
};
