import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverRouter } from "../types/QuiverRouter.js";

export const createRouter = (routers: QuiverRouter[]): QuiverMiddleware => {
  const handler = async (context: QuiverContext) => {
    let ctx = context;

    for (const router of routers) {
      if (router.match(ctx)) {
        ctx.router = router;
      }
    }

    if (ctx.router === undefined) {
      ctx.throw = {
        status: "UNKNOWN_NAMESPACE",
      };
    }

    return ctx;
  };

  return {
    name: "dispatch",
    handler,
  };
};
