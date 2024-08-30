import { QuiverHandler } from "./types/QuiverHandler.js";
import { createThrow } from "./hooks/createThrow.js";
import { createReturn } from "./hooks/createReturn.js";
import { createExit } from "./hooks/createExit.js";
import { createHook } from "./lib/createHook.js";
import { createRoute } from "./hooks/createRoute.js";
import { createFunction } from "./hooks/createOutput.js";
import { createDispatch } from "./hooks/createSelect.js";
import { runHook } from "./lib/runHook.js";
import { QuiverApi } from "./types/QuiverApi.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverController } from "./types/QuiverController.js";
import { QuiverRouter } from "./types/QuiverRouter.js";
import { QuiverUse } from "./types/QuiverUse.js";
import { addMiddleware } from "./router/addMiddleware.js";
import { createState } from "./router/createState.js";
import { addHook } from "./router/addHook.js";

export const createRouter = (
  namespace: string,
  api: QuiverApi,
): QuiverRouter => {
  const init = createState();

  const bind: QuiverRouter["bind"] = () => {
    return {
      match: (ctx) => ctx.path?.namespace === namespace,
      handler,
    };
  };

  const use: QuiverUse = (hook, on, name, handler) => {
    addMiddleware(init.id, hook, on, {
      name,
      handler,
    });
  };

  const routeHook = createHook("route", createRoute());
  const dispatchHook = createHook("dispatch", createDispatch(api));
  const functionHook = createHook("function", createFunction());
  const throwHook = createHook("throw", createThrow());
  const returnHook = createHook("return", createReturn());
  const exitHook = createHook("exit", createExit());

  addHook(init.id, routeHook);
  addHook(init.id, dispatchHook);
  addHook(init.id, functionHook);
  addHook(init.id, throwHook);
  addHook(init.id, returnHook);
  addHook(init.id, exitHook);

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

    for (const hook of hooks) {
      ctx = await runHook(hook, ctx, ctrl);

      if (ctx.abort || ctx.exit || ctx.return || ctx.throw) {
        break;
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

  return { use, bind };
};
