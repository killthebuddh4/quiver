import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { getUniqueId } from "../quiver/getUniqueId.js";

export const createFunction = (): QuiverMiddleware => {
  return {
    name: "input",
    handler: async (ctx) => {
      if (ctx.function === undefined) {
        ctx.error = {
          status: "UNKNOWN_FUNCTION",
          reason: "Function not found in context",
        };

        return ctx;
      }

      const input = ctx.function.input(ctx.request?.arguments);

      if (!input.ok) {
        ctx.throw = { status: "INPUT_TYPE_MISMATCH", reason: input.reason };

        return ctx;
      }

      const output = await ctx.function.handler(input.value, ctx);

      ctx.response = {
        id: getUniqueId(),
        ok: true,
        status: "SUCCESS",
        data: output,
      };

      return ctx;
    },
  };
};
