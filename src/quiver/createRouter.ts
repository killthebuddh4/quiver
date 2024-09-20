import { Maybe } from "../types/util/Maybe.js";
import { createApp } from "./createApp.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverApp } from "../types/QuiverApp.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverAppOptions } from "../types/QuiverAppOptions.js";
import { NewKey } from "../types/util/NewKey.js";
import { Resolve } from "../types/util/Resolve.js";
import { SerialExtension } from "../types/util/SerialExtension.js";
import { QuiverRouter } from "../types/QuiverRouter.js";

export const createRouter = <
  CtxIn,
  CtxOut,
  Routes extends
    | {
        [key: string]:
          | QuiverFunction<any, any, any>
          | QuiverRouter<any, any, any>;
      }
    | undefined,
>(
  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>,
  routes: Routes,
): QuiverRouter<CtxIn, CtxOut, Routes> => {
  const type = "QUIVER_ROUTER" as const;

  const compile = (path?: string[]): QuiverMiddleware<any, any, any, any>[] => {
    if (path === undefined) {
      throw new Error("Path is undefined");
    }

    if (path.length === 0) {
      throw new Error("Path is empty");
    }

    if (routes === undefined) {
      throw new Error("Routes is undefined");
    }

    const route = routes[path[0]];

    if (route === undefined) {
      throw new Error(`Route not found ${path[0]}`);
    }

    const next = route.compile(path.slice(1));

    return [middleware, ...next];
  };

  const route = (path: string[]): Maybe<(i: any, ctx: any) => any> => {
    if (path.length === 0) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
      };
    }

    if (routes === undefined) {
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

  const pipe: QuiverRouter<CtxIn, CtxOut, Routes>["pipe"] = <Exec>(
    path: Routes extends undefined ? string : NewKey<Routes>,
    route: SerialExtension<CtxOut, Exec>,
  ) => {
    const next = routes === undefined ? {} : { ...routes };

    (next as any)[path] = route;

    return createRouter<
      Resolve<
        Exec extends (ctx: infer I) => any
          ? CtxIn extends undefined
            ? Omit<I, keyof CtxOut>
            : Omit<I, keyof CtxIn> & CtxIn
          : never
      >,
      CtxOut,
      Routes & { [key in string]: Exec }
    >(middleware as any, routes as any) as any;
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
        pipe,
        routes,
        compile,
        route,
        app,
      } as any,
      options,
    ) as any;
  };

  return { type, pipe, middleware, routes, compile, route, app };
};
