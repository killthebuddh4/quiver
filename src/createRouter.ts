import { QuiverHandler } from "./types/QuiverHandler.js";
import { createThrow } from "./hooks/createThrow.js";
import { createReturn } from "./hooks/createReturn.js";
import { createExit } from "./hooks/createExit.js";
import { createHook } from "./lib/createHook.js";
import { createRoute } from "./hooks/createRoute.js";
import { createFunction } from "./hooks/createFunction.js";
import { createDispatch } from "./hooks/createDispatch.js";
import { runHook } from "./lib/runHook.js";
import { QuiverApi } from "./types/QuiverApi.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverController } from "./types/QuiverController.js";
import { QuiverRouter } from "./types/QuiverRouter.js";

export const createRouter = (
  namespace: string,
  api: QuiverApi,
): QuiverRouter => {
  const bind: QuiverRouter["bind"] = () => {
    return {
      match: (ctx) => ctx.path?.namespace === namespace,
      handler,
    };
  };

  const routeHook = createHook("route", createRoute());
  const dispatchHook = createHook("dispatch", createDispatch(api));
  const functionHook = createHook("function", createFunction());
  const throwHook = createHook("throw", createThrow());
  const returnHook = createHook("return", createReturn());
  const exitHook = createHook("exit", createExit());

  const hooks = [
    routeHook,
    dispatchHook,
    functionHook,
    throwHook,
    returnHook,
    exitHook,
  ];

  const handler: QuiverHandler = async (
    ctx: QuiverContext,
    ctrl: QuiverController,
  ) => {
    const t = hooks.find((h) => h.name === "throw");

    if (t === undefined) {
      throw new Error("throw hook is required");
    }

    const r = hooks.find((h) => h.name === "return");

    if (r === undefined) {
      throw new Error("return hook is required");
    }

    const e = hooks.find((h) => h.name === "exit");

    if (e === undefined) {
      throw new Error("exit hook is required");
    }

    hooks: for (const hook of hooks) {
      ctx = await runHook(hook, ctx, ctrl);

      if (ctx.abort) {
        break hooks;
      }

      if (ctx.exit || ctx.return || ctx.throw) {
        break hooks;
      }
    }

    if (ctx.abort) {
      if (ctx.throw) {
        ctx = await t.mw.handler(ctx, ctrl);

        return ctx;
      }

      if (ctx.return) {
        ctx = await r.mw.handler(ctx, ctrl);

        return ctx;
      }

      if (ctx.exit) {
        ctx = await e.mw.handler(ctx, ctrl);

        return ctx;
      }

      return ctx;
    }

    if (ctx.exit) {
      ctx = await runHook(e, ctx, ctrl);

      return ctx;
    }

    if (ctx.return) {
      ctx = await runHook(r, ctx, ctrl);

      return ctx;
    }

    if (ctx.throw) {
      ctx = await runHook(t, ctx, ctrl);

      return ctx;
    }

    return ctx;
  };

  return { bind };
};
