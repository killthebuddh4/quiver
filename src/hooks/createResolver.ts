import { QuiverHandler } from "../types/QuiverHandler.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

export const createResolver = (): QuiverMiddleware => {
  const handler: QuiverHandler = async (context) => {
    let ctx = context;

    if (ctx.client === undefined) {
      ctx.error = {
        // TODO
        status: "UNKNOWN_NAMESPACE",
      };

      return ctx;
    }

    for (const route of ctx.client.routes) {
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
