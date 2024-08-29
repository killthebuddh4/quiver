import { QuiverClient } from "./types/QuiverClient.js";
import { QuiverApiSpec } from "./types/QuiverApiSpec.js";
import { QuiverController } from "./types/QuiverController.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverHandler } from "./types/QuiverHandler.js";
import { runHook } from "./quiver/runHook.js";
import { createResolve } from "./hooks/createResolve.js";
import { createHook } from "./quiver/createHook.js";
import { createRequest } from "./quiver/createRequest.js";
import { QuiverRoute } from "./types/QuiverRoute.js";
import { createState } from "./client/createState.js";
import { addMiddleware } from "./client/addMiddleware.js";
import { QuiverUse } from "./types/QuiverUse.js";

export const createClient = <Api extends QuiverApiSpec>(
  address: string,
  namespace: string,
  api: Api,
): QuiverClient<typeof api> => {
  const init = createState();

  const bind = (ctrl: QuiverController): QuiverRoute => {
    init.controller = ctrl;

    return {
      match: (ctx: QuiverContext) => {
        if (ctx.path?.namespace !== namespace) {
          return false;
        }

        return ctx.path.channel === "requests";
      },
      handler,
    };
  };

  init.hooks.push(createHook("resolve", createResolve(init.queue)));

  const handler: QuiverHandler = async (
    ctx: QuiverContext,
    ctrl: QuiverController,
  ) => {
    const t = init.hooks.find((h) => h.name === "throw");

    if (t === undefined) {
      throw new Error("throw hook is required");
    }

    const r = init.hooks.find((h) => h.name === "return");

    if (r === undefined) {
      throw new Error("return hook is required");
    }

    const e = init.hooks.find((h) => h.name === "exit");

    if (e === undefined) {
      throw new Error("exit hook is required");
    }

    hooks: for (const hook of init.hooks) {
      ctx = await runHook(hook, ctx, ctrl);

      if (ctx.abort) {
        break hooks;
      }

      if (ctx.exit || ctx.return || ctx.throw) {
        break hooks;
      }
    }

    return ctx;
  };

  const client = {} as QuiverClient<typeof api>;

  for (const name of Object.keys(api)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any)[name] = async (
      input: ReturnType<(typeof api)[typeof name]["input"]>,
    ) => {
      if (init.controller === null) {
        throw new Error("Client hasn't been bound to Quiver yet");
      }

      const f = createRequest(init.controller);

      console.log(`CLIENT SENDING MESSAGE TO ${namespace}.${name}`);

      const message = await f(address, namespace, {
        function: name,
        arguments: input,
      });

      console.log(`CLIENT SENT MESSAGE: ${message.content}`);

      return new Promise((resolve) => {
        init.queue.set(message.id, resolve);
      });
    };
  }

  const use: QuiverUse = (hook, on, name, handler) => {
    addMiddleware(init.id, hook, on, {
      name,
      handler,
    });
  };

  return { ...client, use, bind } as QuiverClient<typeof api>;
};
