import { QuiverApi } from "../types/QuiverApi.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

export const createDispatch = (api: QuiverApi): QuiverMiddleware => {
  return {
    name: "dispatch",
    handler: async (ctx) => {
      if (ctx.path === undefined) {
        ctx.error = {
          status: "INVALID_PATH",
          reason: "Path not found in context",
        };

        return ctx;
      }

      for (const name of Object.keys(api)) {
        if (ctx.path.function === name) {
          ctx.function = api[name];
        }
      }

      if (ctx.function === undefined) {
        ctx.throw = {
          status: "UNKNOWN_FUNCTION",
          reason: `Function ${ctx.path.function} not found in API`,
        };
      }

      return ctx;
    },
  };
};
