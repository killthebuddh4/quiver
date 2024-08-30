import { QuiverOptions } from "./types/QuiverOptions.js";
import { Quiver } from "./types/Quiver.js";
import { Message } from "./types/Message.js";
import { createState } from "./quiver/createState.js";
import { createContext } from "./lib/createContext.js";
import { runHook } from "./lib/runHook.js";
import { QuiverController } from "./types/QuiverController.js";
import { addUnsubscribe } from "./quiver/addUnsubscribe.js";
import { getUnsubscribe } from "./quiver/getUnsubscribe.js";
import { addClientRouter } from "./quiver/addClientRouter.js";
import { addRouter } from "./quiver/addRouter.js";
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

    outer: {
      quiver: {
        ctx = await runHook(state.hooks.message, ctx, ctrl);

        if (ctx.abort) {
          break outer;
        }

        if (ctx.exit || ctx.return || ctx.throw) {
          break quiver;
        }

        ctx = await runHook(state.hooks.path, ctx, ctrl);

        if (ctx.abort) {
          break outer;
        }

        if (ctx.exit || ctx.return || ctx.throw) {
          break quiver;
        }

        ctx = await runHook(state.hooks.json, ctx, ctrl);

        if (ctx.abort) {
          break outer;
        }

        if (ctx.exit || ctx.return || ctx.throw) {
          break quiver;
        }

        router: {
          if (ctx.path?.channel === "requests") {
            ctx = await runHook(state.hooks.request, ctx, ctrl);

            if (ctx.abort) {
              break outer;
            }

            if (ctx.exit || ctx.return || ctx.throw) {
              break router;
            }

            ctx = await runHook(state.hooks.router, ctx, ctrl);

            if (ctx.abort) {
              break outer;
            }

            if (ctx.exit || ctx.return || ctx.throw) {
              break router;
            }

            ctx = await runHook(state.hooks.route, ctx, ctrl);

            if (ctx.abort) {
              break outer;
            }

            if (ctx.exit || ctx.return || ctx.throw) {
              break router;
            }

            ctx = await runHook(state.hooks.input, ctx, ctrl);

            if (ctx.abort) {
              break outer;
            }

            if (ctx.exit || ctx.return || ctx.throw) {
              break router;
            }

            ctx = await runHook(state.hooks.output, ctx, ctrl);

            if (ctx.abort) {
              break outer;
            }

            if (ctx.exit || ctx.return || ctx.throw) {
              break router;
            }
          }

          if (ctx.exit) {
            ctx = await runHook(state.hooks.exit.router(ctx), ctx, ctrl);

            if (ctx.abort) {
              break outer;
            }
          }

          if (ctx.return) {
            ctx = await runHook(state.hooks.return.router(ctx), ctx, ctrl);

            if (ctx.abort) {
              break outer;
            }
          }

          if (ctx.throw) {
            ctx = await runHook(state.hooks.throw.router(ctx), ctx, ctrl);

            if (ctx.abort) {
              break outer;
            }
          }
        }

        client: {
          if (ctx.path?.channel === "responses") {
            ctx = await runHook(state.hooks.response, ctx, ctrl);

            if (ctx.abort) {
              break outer;
            }

            if (ctx.exit || ctx.return || ctx.throw) {
              break client;
            }

            ctx = await runHook(state.hooks.client, ctx, ctrl);

            if (ctx.abort) {
              break outer;
            }

            if (ctx.exit || ctx.return || ctx.throw) {
              break client;
            }

            ctx = await runHook(state.hooks.resolver, ctx, ctrl);

            if (ctx.abort) {
              break outer;
            }

            if (ctx.exit || ctx.return || ctx.throw) {
              break client;
            }

            // TODO output validation hook

            // TODO yield output hook
          }
        }

        if (ctx.exit) {
          ctx = await runHook(state.hooks.exit.client(ctx), ctx, ctrl);

          if (ctx.abort) {
            break outer;
          }
        }

        if (ctx.return) {
          ctx = await runHook(state.hooks.return.client(ctx), ctx, ctrl);

          if (ctx.abort) {
            break outer;
          }
        }

        if (ctx.throw) {
          ctx = await runHook(state.hooks.throw.client(ctx), ctx, ctrl);

          if (ctx.abort) {
            break outer;
          }
        }
      }

      if (ctx.exit) {
        ctx = await runHook(state.hooks.exit.quiver, ctx, ctrl);

        if (ctx.abort) {
          break outer;
        }
      }

      if (ctx.return) {
        ctx = await runHook(state.hooks.return.quiver, ctx, ctrl);

        if (ctx.abort) {
          break outer;
        }
      }

      if (ctx.throw) {
        ctx = await runHook(state.hooks.throw.quiver, ctx, ctrl);

        if (ctx.abort) {
          break outer;
        }
      }
    }

    if (ctx.abort) {
      if (ctx.throw) {
        // TODO

        return;
      }

      if (ctx.exit) {
        // TODO

        return;
      }

      if (ctx.return) {
        // TODO

        return;
      }

      return;
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
