import { QuiverHandler } from "../types/QuiverHandler.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

export const createResolver = (): QuiverMiddleware => {
  const handler: QuiverHandler = async (context, controller) => {
    let ctx = context;

    for (const route of controller.resolvers) {
      if (route.match(ctx)) {
        ctx.resolver = route;
      }
    }

    if (ctx.resolver === undefined) {
      ctx.error = {
        // TODO
        status: "UNKNOWN_FUNCTION",
      };

      return ctx;
    }

    return ctx;
  };

  return { name: "resolver", handler };
};
