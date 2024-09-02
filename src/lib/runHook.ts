import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverController } from "../types/QuiverController.js";
import { QuiverHook } from "../types/QuiverHook.js";

export const runHook = async (
  hook: QuiverHook,
  context: QuiverContext,
  ctrl: QuiverController,
): Promise<QuiverContext> => {
  let ctx = context;

  outer: {
    inner: {
      for (const mw of hook.before) {
        ctx = await mw.handler(ctx, ctrl);

        if (ctx.error) {
          break outer;
        }

        if (ctx.exit || ctx.return || ctx.throw) {
          break inner;
        }
      }

      ctx = await hook.mw.handler(ctx, ctrl);

      if (ctx.error) {
        break outer;
      }

      if (ctx.exit || ctx.return || ctx.throw) {
        break inner;
      }

      for (const mw of hook.after) {
        ctx = await mw.handler(ctx, ctrl);

        if (ctx.error) {
          break outer;
        }

        if (ctx.exit || ctx.return || ctx.throw) {
          break inner;
        }
      }
    }

    if (ctx.exit) {
      for (const mw of hook.exit) {
        ctx = await mw.handler(ctx, ctrl);

        if (ctx.error) {
          break outer;
        }
      }
    }

    if (ctx.return) {
      for (const mw of hook.return) {
        ctx = await mw.handler(ctx, ctrl);

        if (ctx.error) {
          break outer;
        }
      }
    }

    if (ctx.throw) {
      for (const mw of hook.throw) {
        ctx = await mw.handler(ctx, ctrl);

        if (ctx.error) {
          break outer;
        }
      }
    }
  }

  for (const mw of hook.error) {
    ctx = await mw.handler(ctx, ctrl);
  }

  return ctx;
};
