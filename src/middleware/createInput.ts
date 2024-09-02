import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

export const createInput = (): QuiverMiddleware => {
  return {
    name: "input",
    handler: async (ctx) => {
      if (ctx.route === undefined) {
        ctx.error = {
          status: "UNKNOWN_FUNCTION",
          reason: "Function not found in context",
        };

        return ctx;
      }

      const input = ctx.route.function.input(ctx.request?.arguments);

      if (!input.ok) {
        ctx.throw = { status: "INPUT_TYPE_MISMATCH", reason: input.reason };

        return ctx;
      }

      ctx.input = input.value;

      return ctx;
    },
  };
};
