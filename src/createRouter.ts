import { QuiverRouterOptions } from "./types/QuiverRouterOptions.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { parseQuiverRequest } from "./lib/parseQuiverRequest.js";
import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { QuiverApi } from "./types/QuiverApi.js";
import { QuiverRouter } from "./types/QuiverRouter.js";
import { QuiverHandler } from "./types/QuiverHandler.js";

export const createRouter = (
  namespace: string,
  api: QuiverApi,
  options?: QuiverRouterOptions,
): QuiverRouter => {
  const middleware: QuiverMiddleware[] = options?.middleware ?? [];

  const handler: QuiverHandler = async (context: QuiverContext) => {
    let ctx: QuiverContext = context;
    for (const mw of middleware) {
      try {
        ctx = await mw(ctx);
      } catch {
        const name = "NOT_YET_IMPLEMENTED";

        ctx.throw({
          status: "SERVER_ERROR",
          reason: `Router middleware ${name} threw an error`,
        });

        return;
      }
    }

    if (context.metadata?.request === undefined) {
      ctx.throw({
        status: "SERVER_ERROR",
        reason: `No request found in context (probably because of a buggy middleware)`,
      });

      return;
    }

    const request = parseQuiverRequest(context.metadata?.request);

    if (!request.ok) {
      ctx.throw({
        status: "INVALID_REQUEST",
        reason: `Malformed request found in context (probably because of a buggy middleware)`,
      });

      return;
    }

    const fn = api[request.value.function];

    if (fn === undefined) {
      ctx.throw({ status: "UNKNOWN_FUNCTION" });

      return;
    }

    if (fn.options?.middleware !== undefined) {
      for (const mw of fn.options.middleware) {
        try {
          ctx = await mw(ctx);
        } catch {
          const name = "NOT_YET_IMPLEMENTED";

          ctx.throw({
            status: "SERVER_ERROR",
            reason: `Function middleware ${name} threw an error`,
          });

          return;
        }
      }
    }

    const input = fn.input(request.value.arguments);

    if (!input.ok) {
      ctx.throw({
        status: "INPUT_TYPE_MISMATCH",
      });

      return;
    }

    let output: ReturnType<typeof fn.output>;
    try {
      output = await fn.handler(input, ctx);
    } catch {
      ctx.throw({
        status: "SERVER_ERROR",
        reason: `The function handler threw an error`,
      });

      return;
    }

    if (fn.options?.isNotification) {
      return;
    }

    ctx.return({
      status: "SUCCESS",
      data: output,
    });
  };

  const use = (mw: QuiverMiddleware) => {
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
