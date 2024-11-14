import { Maybe } from "../types/util/Maybe.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { NewKey } from "../types/util/NewKey.js";
import { Resolve } from "../types/util/Resolve.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { PipedCtxIn } from "../types/middleware/PipedCtxIn.js";

export const createRouter = <
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]: QuiverFunction<any, any, any> | QuiverRouter<any, any, any>;
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
    path: keyof Routes extends never ? string : NewKey<Routes>,
    route: any,
  ) => {
    return createRouter<
      Resolve<PipedCtxIn<CtxIn, CtxOut, NextCtxIn<R>>>,
      CtxOut,
      Routes & { [key in string]: typeof route }
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

type NextCtxIn<Next> =
  Next extends QuiverRouter<infer CtxIn, any, any>
    ? CtxIn
    : Next extends QuiverFunction<infer CtxIn, any, any>
      ? CtxIn
      : never;
