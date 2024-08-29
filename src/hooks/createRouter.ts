import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverRoute } from "../types/QuiverRoute.js";

export const createRouter = (routes: QuiverRoute[]): QuiverMiddleware => {
  const handler = async (context: QuiverContext) => {
    for (const route of routes) {
      if (route.match(context)) {
        context.route = route;
      }
    }

    if (context.route === undefined) {
      context.throw = {
        status: "UNKNOWN_FUNCTION",
      };
    }

    return context;
  };

  return {
    name: "router",
    handler,
  };
};
