import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

export const createOutput = (): QuiverMiddleware => {
  return {
    name: "output",
    handler: async (ctx, ctrl) => {
      if (ctx.route === undefined) {
        ctx.error = {
          status: "UNKNOWN_FUNCTION",
          reason: "Function not found in context",
        };

        return ctx;
      }

      if (ctx.input === undefined) {
        ctx.error = {
          status: "MISSING_INPUT",
          reason: "Input not found in context",
        };

        return ctx;
      }

      const output = await ctx.route.function.handler(ctx.input, ctx, ctrl);

      ctx.output = {
        status: "SUCCESS",
        data: output,
      };

      return ctx;
    },
  };
};
