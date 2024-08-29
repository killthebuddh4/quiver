import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

export const createRoute = (): QuiverMiddleware => {
  return {
    name: "route",
    handler: async (ctx) => {
      if (ctx.request === undefined) {
        ctx.error = {
          status: "INVALID_REQUEST",
          reason: "Request not found in context",
        };
      }

      return ctx;
    },
  };
};
