import { QuiverClientRouter } from "../types/QuiverClientRouter.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

export const createClient = (
  routers: QuiverClientRouter[],
): QuiverMiddleware => {
  const handler = async (context: QuiverContext) => {
    let ctx = context;

    for (const router of routers) {
      if (router.match(ctx)) {
        ctx.client = router;
      }
    }

    if (ctx.client === undefined) {
      ctx.throw = {
        status: "UNKNOWN_NAMESPACE",
      };
    }

    return ctx;
  };

  return {
    name: "client",
    handler,
  };
};
