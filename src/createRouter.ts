import { z } from "zod";
import { QuiverRouterOptions } from "./types/QuiverRouterOptions.js";
import { quiverRequestSchema } from "./lib/quiverRequestSchema.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { QuiverApi } from "./types/QuiverApi.js";
import { QuiverRequest } from "./types/QuiverRequest.js";
import { QuiverRouter } from "./types/QuiverRouter.js";
import { QuiverHandler } from "./types/QuiverHandler.js";

export const createRouter = (
  namespace: string,
  api: QuiverApi,
  options?: QuiverRouterOptions,
): QuiverRouter => {
  const middleware: QuiverMiddleware[] = options?.middleware ?? [];

  const handler: QuiverHandler = async (context: QuiverContext) => {
    console.log(`Router ${namespace} received a request`);

    let ctx: QuiverContext = context;
    for (const mw of middleware) {
      try {
        ctx = await mw(ctx);
      } catch {
        const name = "NOT_YET_IMPLEMENTED";

        console.error(`Router middleware ${name} threw an error`);

        ctx.throw({
          status: "SERVER_ERROR",
          reason: `Router middleware ${name} threw an error`,
        });

        return;
      }
    }

    if (context.metadata?.request === undefined) {
      console.error(
        `No request found in context (probably because of a buggy middleware)`,
      );

      ctx.throw({
        status: "SERVER_ERROR",
        reason: `No request found in context (probably because of a buggy middleware)`,
      });

      return;
    }

    let request: QuiverRequest;
    try {
      request = quiverRequestSchema.parse(context.metadata?.request);
    } catch {
      console.error(
        `Malformed request found in context (probably because of a buggy middleware)`,
      );

      ctx.throw({
        status: "INVALID_REQUEST",
        reason: `Malformed request found in context (probably because of a buggy middleware)`,
      });

      return;
    }

    const fn = api[request.function];

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

    let input: z.infer<typeof fn.input>;
    try {
      input = fn.input.parse(request.arguments);
    } catch {
      ctx.throw({
        status: "INPUT_TYPE_MISMATCH",
        // TODO: include more information about the error
      });

      return;
    }

    let output: z.infer<typeof fn.output>;
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
      // TODO, validate output with this option (output should be void-ish)
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

  return {
    bind,
    use,
  };
};
