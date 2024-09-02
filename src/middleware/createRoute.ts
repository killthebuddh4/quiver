import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

export const createRoute = (): QuiverMiddleware => {
  const handler = async (context: QuiverContext) => {
    let ctx = context;

    if (ctx.router === undefined) {
      ctx.error = {
        status: "UNKNOWN_NAMESPACE",
      };

      return ctx;
    }

    for (const route of ctx.router.routes) {
      if (route.match(ctx)) {
        ctx.route = route;
      }
    }

    if (ctx.route === undefined) {
      ctx.throw = {
        status: "UNKNOWN_FUNCTION",
      };
    }

    return ctx;
  };

  return {
    name: "dispatch",
    handler,
  };
};
