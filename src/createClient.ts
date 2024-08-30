import { QuiverClient } from "./types/QuiverClient.js";
import { QuiverApiSpec } from "./types/QuiverApiSpec.js";
import { QuiverController } from "./types/QuiverController.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverHandler } from "./types/QuiverHandler.js";
import { runHook } from "./lib/runHook.js";
import { createResolver } from "./hooks/createResolver.js";
import { createHook } from "./lib/createHook.js";
import { createRequest } from "./lib/createRequest.js";
import { QuiverRoute } from "./types/QuiverRoute.js";
import { createState } from "./client/createState.js";
import { addMiddleware } from "./client/addMiddleware.js";
import { QuiverUse } from "./types/QuiverUse.js";
import { QuiverClientRouter } from "./types/QuiverClientRouter.js";

export const createClient = <Api extends QuiverApiSpec>(
  address: string,
  namespace: string,
  api: Api,
): QuiverClient<typeof api> => {
  const init = createState();

  const bind = (ctrl: QuiverController): QuiverClientRouter => {
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
