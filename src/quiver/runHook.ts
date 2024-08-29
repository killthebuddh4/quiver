import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverController } from "../types/QuiverController.js";
import { QuiverHook } from "../types/QuiverHook.js";

export const runHook = async (
  hook: QuiverHook,
  context: QuiverContext,
  ctrl: QuiverController,
): Promise<QuiverContext> => {
  let ctx = context;

  for (const mw of hook.before) {
    ctx = await mw.handler(ctx, ctrl);

    if (ctx.abort) {
      return ctx;
    }
  }

  ctx = await hook.mw.handler(ctx, ctrl);

  if (ctx.abort) {
    return ctx;
  }

  if (ctx.throw) {
    for (const mw of hook.throw) {
      ctx = await mw.handler(ctx, ctrl);

      if (ctx.abort) {
        return ctx;
      }
    }

    return ctx;
  }

  if (ctx.return) {
    for (const mw of hook.return) {
      ctx = await mw.handler(ctx, ctrl);

      if (ctx.abort) {
        return ctx;
      }
    }

    return ctx;
  }

  if (ctx.exit) {
    for (const mw of hook.exit) {
      ctx = await mw.handler(ctx, ctrl);

      if (ctx.abort) {
        return ctx;
      }
    }

    return ctx;
  }

  for (const mw of hook.after) {
    ctx = await mw.handler(ctx, ctrl);

    if (ctx.abort) {
      return ctx;
    }
  }

  return ctx;
};
