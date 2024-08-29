import { QuiverOptions } from "./types/QuiverOptions.js";
import { Quiver } from "./types/Quiver.js";
import { Message } from "./types/Message.js";
import { createMessage } from "./hooks/createMessage.js";
import { createPath } from "./hooks/createPath.js";
import { createJson } from "./hooks/createJson.js";
import { createRequest } from "./hooks/createRequest.js";
import { createResponse } from "./hooks/createResponse.js";
import { createRouter } from "./hooks/createRouter.js";
import { createThrow } from "./hooks/createThrow.js";
import { createExit } from "./hooks/createExit.js";
import { createState } from "./lib/createState.js";
import { getState } from "./lib/getState.js";
import { createContext } from "./lib/createContext.js";
import { createHook } from "./lib/createHook.js";
import { runHook } from "./lib/runHook.js";
import { addRoute } from "./lib/addRoute.js";
import { addHook } from "./lib/addHook.js";
import { QuiverController } from "./types/QuiverController.js";
import { addUnsubscribe } from "./lib/addUnsubscribe.js";
import { getUnsubscribe } from "./lib/getUnsubscribe.js";
import { addMiddleware } from "./lib/addMiddleware.js";

export const createQuiver = (options?: QuiverOptions): Quiver => {
  const init = createState(options);

  const fig = init.options?.fig;

  if (fig === undefined) {
    throw new Error("fig is required, others aren't implemented yet");
  }

  const stop: Quiver["stop"] = () => {
    fig.stop();

    const unsubscribe = getUnsubscribe(init.id);

    if (unsubscribe) {
      unsubscribe();
    }
  };

  const start: Quiver["start"] = async () => {
    await fig.start();

    const { unsubscribe } = await fig.subscribe(handler);

    addUnsubscribe(init.id, unsubscribe);

    return stop;
  };

  const messageHook = createHook("message", createMessage());
  const pathHook = createHook("path", createPath());
  const jsonHook = createHook("json", createJson());
  const requestHook = createHook("request", createRequest());
  const responseHook = createHook("response", createResponse());
  const routerHook = createHook("router", createRouter(init.routes));
  const throwHook = createHook("throw", createThrow());
  const exitHook = createHook("exit", createExit());

  addHook(init.id, messageHook);
  addHook(init.id, pathHook);
  addHook(init.id, jsonHook);
  addHook(init.id, requestHook);
  addHook(init.id, responseHook);
  addHook(init.id, routerHook);
  addHook(init.id, throwHook);
  addHook(init.id, exitHook);

  // TODO
  const ctrl: QuiverController = {
    address: fig.address,
    send: fig.publish,
  };

  const handler = async (received: Message) => {
    if (received.senderAddress === ctrl.address) {
      console.log("QUIVER IGNORING OWN MESSAGE");
      return;
    }

    const hooks = getState(init.id).hooks;

    const t = hooks.find((h) => h.name === "throw");

    if (t === undefined) {
      throw new Error("throw hook is required");
    }

    const e = hooks.find((h) => h.name === "exit");

    if (e === undefined) {
      throw new Error("exit hook is required");
    }

    let ctx = createContext(fig.address, received);

    hooks: for (const hook of hooks) {
      ctx = await runHook(hook, ctx, ctrl);

      if (ctx.abort) {
        break hooks;
      }

      if (ctx.exit || ctx.throw) {
        break hooks;
      }
    }

    if (ctx.abort) {
      if (ctx.throw) {
        ctx = await t.mw.handler(ctx, ctrl);

        return;
      }

      if (ctx.exit) {
        ctx = await e.mw.handler(ctx, ctrl);

        return;
      }

      return;
    }

    if (ctx.exit) {
      ctx = await runHook(e, ctx, ctrl);

      return;
    }

    if (ctx.throw) {
      ctx = await runHook(t, ctx, ctrl);

      return;
    }
  };

  const client: Quiver["client"] = (qc) => {
    const bound = qc.bind(ctrl);
    addRoute(init.id, bound);
  };

  const router: Quiver["router"] = (qr) => {
    const router = qr.bind(ctrl);
    addRoute(init.id, router);
  };

  const use: Quiver["use"] = (hook, on, name, handler) => {
    addMiddleware(init.id, hook, on, {
      name,
      handler,
    });
  };

  return {
    use,
    client,
    router,
    start,
    stop,
  };
};
