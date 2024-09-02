import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverController } from "../types/QuiverController.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

export const runMiddleware = async (
  mw: QuiverMiddleware,
  context: QuiverContext,
  ctrl: QuiverController,
): Promise<QuiverContext> => {
  let ctx = context;

  outer: {
    inner: {
      for (const h of mw.before) {
        ctx = await h(ctx, ctrl);

        if (ctx.error) {
          break outer;
        }

        if (ctx.exit || ctx.return || ctx.throw) {
          break inner;
        }
      }

      ctx = await mw.handler(ctx, ctrl);

      if (ctx.error) {
        break outer;
      }

      if (ctx.exit || ctx.return || ctx.throw) {
        break inner;
      }

      for (const h of mw.after) {
        ctx = await h(ctx, ctrl);

        if (ctx.error) {
          break outer;
        }

        if (ctx.exit || ctx.return || ctx.throw) {
          break inner;
        }
      }
    }

    if (ctx.exit) {
      for (const h of mw.exit) {
        ctx = await h(ctx, ctrl);

        if (ctx.error) {
          break outer;
        }
      }
    }

    if (ctx.return) {
      for (const h of mw.return) {
        ctx = await h(ctx, ctrl);

        if (ctx.error) {
          break outer;
        }
      }
    }

    if (ctx.throw) {
      for (const h of mw.throw) {
        ctx = await h(ctx, ctrl);

        if (ctx.error) {
          break outer;
        }
      }
    }
  }

  for (const h of mw.error) {
    ctx = await h(ctx, ctrl);
  }

  return ctx;
};
