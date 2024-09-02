import { QuiverOptions } from "./types/QuiverOptions.js";
import { QuiverHook } from "./types/QuiverHook.js";
import { Quiver } from "./types/Quiver.js";
import { Message } from "./types/Message.js";
import { createState } from "./quiver/createState.js";
import { createContext } from "./lib/createContext.js";
import { runHook } from "./lib/runHook.js";
import { QuiverController } from "./types/QuiverController.js";
import { addUnsubscribe } from "./quiver/addUnsubscribe.js";
import { getUnsubscribe } from "./quiver/getUnsubscribe.js";
import { addRouter } from "./quiver/addRouter.js";
import { getHook } from "./quiver/getHook.js";
// import { createInput } from "./hooks/createInput.js";
// import { createOutput } from "./hooks/createOutput.js";
// import { createResolver } from "./hooks/createResolver.js";
// import { createClient } from "./hooks/createClient.js";
// import { createHook } from "./lib/createHook.js";
// import { createMessage } from "./hooks/createMessage.js";
// import { createPath } from "./hooks/createPath.js";
// import { createJson } from "./hooks/createJson.js";
// import { createRequest } from "./hooks/createRequest.js";
// import { createResponse } from "./hooks/createResponse.js";
// import { createRouter } from "./hooks/createRouter.js";
// import { createRoute } from "./hooks/createRoute.js";
// import { createThrow } from "./hooks/createThrow.js";
// import { createExit } from "./hooks/createExit.js";

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

  const ctrl: QuiverController = {
    address: fig.address,
    send: fig.publish,
  };

  const handler = async (received: Message) => {
    if (received.senderAddress === ctrl.address) {
      return;
    }

    const state = createState();

    let ctx = createContext(fig.address, received);
    let hook: QuiverHook;

    outer: {
      inner: {
      hook = getHook("RECV_MESSAGE", ctx, ctrl);

      ctx = await runHook(hook, ctx, ctrl);

      if (ctx.error) {
        break outer;
      }

      if (ctx.exit || ctx.return || ctx.throw) {
        break inner;
      }

      hook = getHook("PARSE_PATH", ctx, ctrl);

      ctx = await runHook(hook, ctx, ctrl);

      if (ctx.error || ctx.exit || ctx.return || ctx.throw) {
        break outer;
      }

      hook = getHook("PARSE_JSON", ctx, ctrl);

      ctx = await runHook(hook, ctx, ctrl);

      if (ctx.error || ctx.exit || ctx.return || ctx.throw) {
        break outer;
      }

      if (ctx.url?.channel === "requests") {
        hook = getHook("PARSE_REQUEST", ctx, ctrl);

        ctx = await runHook(hook, ctx, ctrl);

        if (ctx.error || ctx.exit || ctx.return || ctx.throw) {
          break outer;
        }

        hook = getHook("GET_ROUTE", ctx, ctrl);

        ctx = await runHook(hook, ctx, ctrl);

        if (ctx.error || ctx.exit || ctx.return || ctx.throw) {
          break outer;
        }

        hook = getHook("VALIDATE_INPUT", ctx, ctrl);

        ctx = await runHook(hook, ctx, ctrl);

        if (ctx.error || ctx.exit || ctx.return || ctx.throw) {
          break outer;
        }

        hook = getHook("CALL_FUNCTION", ctx, ctrl);

        ctx = await runHook(hook, ctx, ctrl);

        if (ctx.error || ctx.exit || ctx.return || ctx.throw) {
          break outer;
        }

        hook = getHook("VALIDATE_OUTPUT", ctx, ctrl);

        ctx = await runHook(hook, ctx, ctrl);
      }

      if (ctx.url?.channel === "responses") {
        hook = getHook("PARSE_RESPONSE", ctx, ctrl);

        ctx = await runHook(hook, ctx, ctrl);

        if (ctx.error || ctx.exit || ctx.return || ctx.throw) {
          break outer;
        }

        hook = getHook("GET_REQUEST", ctx, ctrl);

        ctx = await runHook(hook, ctx, ctrl);

        if (ctx.error || ctx.exit || ctx.return || ctx.throw) {
          break outer;
        }

        hook = getHook("VALIDATE_OUTPUT", ctx, ctrl);

        ctx = await runHook(hook, ctx, ctrl);

        if (ctx.exit) {
          hook = getHook("EXIT", ctx, ctrl);

          ctx = await runHook(hook, ctx, ctrl);
        }

        if (ctx.return) {
          hook = getHook("RETURN", ctx, ctrl);

          ctx = await runHook(hook, ctx, ctrl);
        }
      }
    }
  };

  const client: Quiver["client"] = (qc) => {
    const bound = qc.bind(use, ctrl);
    addClientRouter(init.id, bound);
  };

  const router: Quiver["router"] = (qr) => {
    const bound = qr.bind(use);
    addRouter(init.id, bound);
  };

  const use: Quiver["use"] = (hook, on, name, handler) => {
    // TODO
    console.log("use", hook, on, name, handler);
  };

  return {
    use,
    client,
    router,
    start,
    stop,
  };
};
