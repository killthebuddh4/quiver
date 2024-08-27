import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverHook } from "../types/QuiverHook.js";
import { isDone } from "../context/isDone.js";

export const run = async (hook: QuiverHook, context: QuiverContext) => {
  let ctx = context;

  for (const mw of hook.before) {
    ctx = await mw.handler(ctx);

    if (isDone(ctx)) {
      return ctx;
    }
  }

  ctx = await hook.mw.handler(ctx);

  if (isDone(ctx)) {
    return ctx;
  }

  if (ctx.error) {
    for (const mw of hook.catch) {
      ctx = await mw.handler(ctx);

      if (isDone(ctx)) {
        return ctx;
      }
    }
  }

  if (ctx.error) {
    if (ctx.throw === undefined) {
      throw new Error("TODO");
    }

    ctx.throw(ctx.error);

    return ctx;
  }

  for (const mw of hook.after) {
    ctx = await mw.handler(ctx);

    if (isDone(ctx)) {
      return ctx;
    }
  }

  return ctx;
};
