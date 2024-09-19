import { Maybe } from "../types/util/Maybe.js";
import { createApp } from "./createApp.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverApp } from "../types/QuiverApp.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverPipeline } from "../types/QuiverPipeline.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverAppOptions } from "../types/QuiverAppOptions.js";

export const createRouter = <
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]:
      | QuiverFunction<CtxOut, any, any>
      | QuiverRouter<CtxOut, any, any>;
  },
>(
  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>,
  routes: Routes,
): QuiverRouter<CtxIn, CtxOut, Routes> => {
  const type = "QUIVER_ROUTER" as const;

  const compile = (path?: string[]): QuiverPipeline[] => {
    if (path === undefined) {
      throw new Error("Path is undefined");
    }

    if (path.length === 0) {
      throw new Error("Path is empty");
    }

    const route = routes[path[0]];

    if (route === undefined) {
      throw new Error(`Route not found ${path[0]}`);
    }

    const next = route.compile(path.slice(1));

    return [middleware.compile(), ...next];
  };

  const route = (path: string[]): Maybe<(i: any, ctx: any) => any> => {
    if (path.length === 0) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
      };
    }

    const route = routes[path[0]];

    if (route === undefined) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
      };
    }

    return route.route(path.slice(1));
  };

  const app = (
    namespace: string,
    options?: QuiverAppOptions,
  ): CtxIn extends QuiverContext
    ? QuiverApp<QuiverRouter<CtxIn, CtxOut, Routes>>
    : never => {
    return createApp(
      namespace,
      {
        type,
        middleware,
        routes,
        compile,
        route,
        app,
      },
      options,
    ) as any;
  };

  return { type, middleware, routes, compile, route, app };
};
