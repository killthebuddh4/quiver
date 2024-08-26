import { QuiverRouterOptions } from "./types/QuiverRouterOptions.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverApi } from "./types/QuiverApi.js";
import { QuiverRouter } from "./types/QuiverRouter.js";
import { QuiverHandler } from "./types/QuiverHandler.js";
import { QuiverMiddleware } from "./types/QuiverMiddleware.js";

export const createRouter = (
  namespace: string,
  api: QuiverApi,
  options?: QuiverRouterOptions,
): QuiverRouter => {
  const middleware: QuiverMiddleware[] = options?.middleware ?? [];

  const handler: QuiverHandler = async (dispatch, context) => {
    let ctx: QuiverContext = context;

    for (const mw of middleware) {
      try {
        ctx = await mw(dispatch, ctx);
      } catch {
        const name = "NOT_YET_IMPLEMENTED";

        dispatch.throw({
          status: "SERVER_ERROR",
          reason: `Router middleware ${name} threw an error`,
        });

        return;
      }
    }

    const fn = api[ctx.request.function];

    if (fn === undefined) {
      return ctx.throw({ status: "UNKNOWN_FUNCTION" });
    }

    const input = fn.input(ctx.request.arguments);

    if (!input.ok) {
      return ctx.throw({
        status: "INPUT_TYPE_MISMATCH",
      });
    }

    if (fn.options?.middleware !== undefined) {
      for (const mw of fn.options.middleware) {
        try {
          ctx = await mw(ctx);
        } catch {
          const name = "NOT_YET_IMPLEMENTED";

          return ctx.throw({
            status: "SERVER_ERROR",
            reason: `Function middleware ${name} threw an error`,
          });
        }
      }
    }

    let output: ReturnType<typeof fn.output>;
    try {
      output = await fn.handler(input, ctx);
    } catch {
      return ctx.throw({
        status: "SERVER_ERROR",
        reason: `The function handler threw an error`,
      });
    }

    return ctx.return({
      status: "SUCCESS",
      data: output,
    });
  };

  const use = (mw: QuiverHandler) => {
    middleware.push(mw);
  };

  const bind = () => {
    return {
      namespace,
      handler,
    };
  };

  return { bind, use };
};
