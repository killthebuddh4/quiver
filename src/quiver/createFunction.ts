import { QuiverPipeline } from "../types/QuiverPipeline.js";
import { Maybe } from "../types/util/Maybe.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverApp } from "../types/QuiverApp.js";
import { createApp } from "./createApp.js";
import { QuiverAppOptions } from "../types/QuiverAppOptions.js";

export const createFunction = <
  CtxIn,
  CtxOut,
  Exec extends (...args: any[]) => any,
>(
  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>,
  exec: Exec,
): QuiverFunction<CtxIn, CtxOut, Exec> => {
  const type = "QUIVER_FUNCTION" as const;

  const compile = (path?: string[]): QuiverPipeline[] => {
    if (path !== undefined && path.length > 0) {
      throw new Error("QuiverFunction.compile() does not take any arguments");
    }

    return [middleware.compile()];
  };

  const route = (path?: string[]): Maybe<(i: any, ctx: any) => any> => {
    if (path !== undefined && path.length > 0) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
      };
    }

    return {
      ok: true,
      value: exec,
    };
  };

  const app = (
    namespace: string,
    options?: QuiverAppOptions,
  ): CtxIn extends QuiverContext
    ? QuiverApp<QuiverFunction<CtxIn, CtxOut, Exec>>
    : never => {
    return createApp(
      namespace,
      {
        type,
        exec,
        app,
        middleware,
        route,
        compile,
      },
      options,
    ) as any;
  };

  return { type, middleware, route, compile, exec, app };
};
