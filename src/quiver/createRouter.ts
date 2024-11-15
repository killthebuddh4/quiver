import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { Resolve } from "../types/util/Resolve.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { PipedCtxIn } from "../types/middleware/PipedCtxIn.js";
import { RouterCtxIn } from "../types/util/RouterCtxIn.js";
import { RouteableRoute } from "../types/router/RouteableRoute.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { createHandler } from "./createHandler.js";
import { RouteableFunction } from "../types/router/RouteableFunction.js";
import { FunctionCtxIn } from "../types/router/FunctionCtxIn.js";

export const createRouter = <
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]:
      | QuiverRouter<any, any, any>
      | QuiverFunction<any, any, any>
      | undefined;
  },
>(
  xmtp: QuiverXmtp,
  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>,
  routes: Routes,
): QuiverRouter<CtxIn, CtxOut, Routes> => {
  const type = "QUIVER_ROUTER" as const;

  const next = (path: string) => {
    return routes[path];
  };

  const use = <P extends string, R>(
    path: P,
    route: RouteableRoute<QuiverRouter<CtxIn, CtxOut, any>, R>,
  ) => {
    return createRouter<
      Resolve<PipedCtxIn<CtxIn, CtxOut, RouterCtxIn<R>>>,
      CtxOut,
      Routes & {
        [key in P]: R;
      }
    >(
      xmtp,
      middleware as any,
      {
        ...(routes || {}),
        [path]: route,
      } as any,
    ) as any;
  };

  const bind = <P extends string, R>(
    path: P,
    route: RouteableFunction<QuiverRouter<CtxIn, CtxOut, any>, R>,
  ) => {
    return createRouter<
      Resolve<PipedCtxIn<CtxIn, CtxOut, FunctionCtxIn<R>>>,
      CtxOut,
      Routes & {
        [key in P]: R;
      }
    >(
      xmtp,
      middleware as any,
      {
        ...(routes || {}),
        [path]: route,
      } as any,
    ) as any;
  };

  const listen = (namespace: string) => {
    const handler = createHandler(namespace, xmtp, {
      type,
      middleware,
      routes,
      next,
      use,
      bind,
      listen,
    });

    const sub = xmtp.subscribe(handler);

    return {
      stop: () => {
        sub.then((s) => s.unsubscribe());
      },
    };
  };

  return { type, middleware, routes, next, use, bind, listen };
};
