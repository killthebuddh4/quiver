import { QuiverClient } from "./types/QuiverClient.js";
import { QuiverApiSpec } from "./types/QuiverApiSpec.js";
import { QuiverController } from "./types/QuiverController.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverUse } from "./types/QuiverUse.js";
import { QuiverClientRoute } from "./types/QuiverClientRoute.js";
import { QuiverClientRouter } from "./types/QuiverClientRouter.js";
import { QuiverRequest } from "./types/QuiverRequest.js";

export const createClient = <Api extends QuiverApiSpec>(
  address: string,
  namespace: string,
  api: Api,
): QuiverClient<typeof api> => {
  let init: {
    use: QuiverUse;
    ctrl: QuiverController;
    routes: QuiverClientRoute[];
  } | null = null;

  const bind = (use: QuiverUse, ctrl: QuiverController): QuiverClientRouter => {
    init = {
      use,
      ctrl,
      routes: [],
    };

    return {
      match: (ctx: QuiverContext) => {
        if (ctx.path?.namespace !== namespace) {
          return false;
        }

        return ctx.path.channel === "requests";
      },
      routes: init.routes,
    };
  };

  const client = {} as QuiverClient<typeof api>;

  for (const name of Object.keys(api)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any)[name] = async (
      input: ReturnType<(typeof api)[typeof name]["input"]>,
    ) => {
      if (init === null) {
        throw new Error("Client hasn't been bound to Quiver yet");
      }

      const conversationId = `quiver/0.0.1/requests/${init.ctrl.address}/${namespace}/${name}`;

      const req: QuiverRequest = {
        function: name,
        arguments: input,
      };

      let content;
      try {
        content = JSON.stringify(req);
      } catch {
        throw new Error(`Failed to serialize request to ${conversationId}`);
      }

      const message = await init.ctrl.send({
        conversation: {
          peerAddress: address,
          context: {
            conversationId,
            metadata: {},
          },
        },
        content,
      });

      return new Promise((resolve, reject) => {
        if (init === null) {
          reject(new Error("Client hasn't been bound to Quiver yet"));
        } else {
          init.routes.push({
            match: (ctx: QuiverContext) => {
              return ctx.response?.id === message.id;
            },
            resolve,
          });
        }
      });
    };
  }

  const use: QuiverUse = (...args) => {
    if (init == null) {
      throw new Error("Client hasn't been bound to Quiver yet");
    }

    init.use(...args);
  };

  return { ...client, use, bind } as QuiverClient<typeof api>;
};
