import { QuiverOptions } from "./types/QuiverOptions.js";
import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { Quiver } from "./types/Quiver.js";
import { Message } from "./types/Message.js";
import { runMiddleware } from "./lib/runMiddleware.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { createMiddleware } from "./lib/createMiddleware.js";
import { store } from "./lib/store.js";
import { Fig } from "./types/Fig.js";
import { Wallet } from "@ethersproject/wallet";
import { createMessage } from "./middlewares/createMessage.js";
import { createParseUrl } from "./middlewares/creatParseUrl.js";
import { createParseJson } from "./middlewares/createParseJson.js";
import { createParseRequest } from "./middlewares/createParseRequest.js";
import { createGetRoute } from "./middlewares/createGetRoute.js";
import { createValidateInput } from "./middlewares/createValidateInput.js";
import { createCallFunction } from "./middlewares/createCallFunction.js";
import { createParseResponse } from "./middlewares/createParseResponse.js";
import { createGetClient } from "./middlewares/createResolver.js";
import { createValidateOutput } from "./middlewares/createValidateOutput.js";
import { createExit } from "./middlewares/createExit.js";
import { createReturn } from "./middlewares/createReturn.js";
import { createThrow } from "./middlewares/createThrow.js";

export const createQuiver = (options?: QuiverOptions): Quiver => {
  const wallet = Wallet.createRandom();

  store.set(wallet.address, {
    fig: {} as unknown as Fig,
    hooks: [],
    routes: [],
    clients: [],
    options,
  });

  const stop: Quiver["stop"] = () => {
    const state = store.get(wallet.address);

    if (state === undefined) {
      return;
    }

    if (state.fig === undefined) {
      return;
    }

    state.fig.stop();

    state.subscriber?.unsubscribe();
  };

  const start: Quiver["start"] = async () => {
    const state = store.get(wallet.address);

    if (state === undefined) {
      throw new Error(
        `Quiver state with address "${wallet.address}" not found`,
      );
    }

    if (state.fig === undefined) {
      throw new Error(
        `Fig not found in Quiver state with address "${wallet.address}"`,
      );
    }

    if (state.subscriber !== undefined) {
      throw new Error(
        `Subscriber already exists in Quiver state with address "${wallet.address}"`,
      );
    }

    await state.fig.start();

    const subscriber = await state.fig.subscribe(handler);

    store.set(wallet.address, { ...state, subscriber });

    return stop;
  };

  const handler = async (received: Message) => {
    const state = store.get(wallet.address);

    if (state === undefined) {
      throw new Error(
        `Quiver state with address "${wallet.address}" not found`,
      );
    }

    if (state.fig === undefined) {
      throw new Error(
        `Fig not found in Quiver state with address "${wallet.address}"`,
      );
    }

    if (received.senderAddress === state.fig.address) {
      return;
    }

    const ctrl = null;

    let ctx: QuiverContext = {
      received,
      state,
    };

    let mw: QuiverMiddleware;

    outer: {
      inner: {
        mw = createMiddleware(
          wallet.address,
          "RECV_MESSAGE",
          [],
          createMessage(),
        );

        ctx = await runMiddleware(mw, ctx, ctrl);

        if (ctx.error) {
          break outer;
        }

        if (ctx.exit || ctx.return || ctx.throw) {
          break inner;
        }

        mw = createMiddleware(
          wallet.address,
          "PARSE_JSON",
          [],
          createParseJson(),
        );

        ctx = await runMiddleware(mw, ctx, ctrl);

        if (ctx.error) {
          break outer;
        }

        if (ctx.exit || ctx.return || ctx.throw) {
          break inner;
        }

        mw = createMiddleware(
          wallet.address,
          "PARSE_URL",
          [],
          createParseUrl(),
        );

        if (ctx.error) {
          break outer;
        }

        if (ctx.exit || ctx.return || ctx.throw) {
          break inner;
        }

        if (ctx.url?.channel === "requests") {
          mw = createMiddleware(
            wallet.address,
            "PARSE_REQUEST",
            [],
            createParseRequest(),
          );

          ctx = await runMiddleware(mw, ctx, ctrl);

          if (ctx.error) {
            break outer;
          }

          if (ctx.exit || ctx.return || ctx.throw) {
            break inner;
          }

          mw = createMiddleware(
            wallet.address,
            "GET_ROUTE",
            [],
            createGetRoute(),
          );

          ctx = await runMiddleware(mw, ctx, ctrl);

          if (ctx.error) {
            break outer;
          }

          if (ctx.exit || ctx.return || ctx.throw) {
            break inner;
          }

          mw = createMiddleware(
            wallet.address,
            "VALIDATE_INPUT",
            [],
            createValidateInput(),
          );

          ctx = await runMiddleware(mw, ctx, ctrl);

          if (ctx.error) {
            break outer;
          }

          if (ctx.exit || ctx.return || ctx.throw) {
            break inner;
          }

          mw = createMiddleware(
            wallet.address,
            "CALL_FUNCTION",
            [],
            createCallFunction(),
          );

          ctx = await runMiddleware(mw, ctx, ctrl);

          if (ctx.error) {
            break outer;
          }

          if (ctx.exit || ctx.return || ctx.throw) {
            break inner;
          }
        }

        if (ctx.url?.channel === "responses") {
          mw = createMiddleware(
            wallet.address,
            "PARSE_RESPONSE",
            [],
            createParseResponse(),
          );

          ctx = await runMiddleware(mw, ctx, ctrl);

          if (ctx.error) {
            break outer;
          }

          if (ctx.exit || ctx.return || ctx.throw) {
            break inner;
          }

          mw = createMiddleware(
            wallet.address,
            "GET_REQUEST",
            [],
            createGetClient(),
          );

          ctx = await runMiddleware(mw, ctx, ctrl);

          if (ctx.error) {
            break outer;
          }

          if (ctx.exit || ctx.return || ctx.throw) {
            break inner;
          }

          mw = createMiddleware(
            wallet.address,
            "VALIDATE_OUTPUT",
            [],
            createValidateOutput(),
          );

          ctx = await runMiddleware(mw, ctx, ctrl);

          if (ctx.error) {
            break outer;
          }

          if (ctx.exit || ctx.return || ctx.throw) {
            break inner;
          }
        }
      }

      /* BREAK INNER JUMPS HERE */

      if (ctx.exit) {
        mw = createMiddleware(wallet.address, "EXIT", [], createExit());

        ctx = await runMiddleware(mw, ctx, ctrl);

        if (ctx.error) {
          break outer;
        }
      }

      if (ctx.return) {
        mw = createMiddleware(wallet.address, "RETURN", [], createReturn());

        ctx = await runMiddleware(mw, ctx, ctrl);

        if (ctx.error) {
          break outer;
        }
      }

      if (ctx.throw) {
        mw = createMiddleware(wallet.address, "THROW", [], createThrow());

        ctx = await runMiddleware(mw, ctx, ctrl);

        if (ctx.error) {
          break outer;
        }
      }
    }

    /* BREAK OUTER JUMPS HERE */

    if (ctx.error) {
      // TODO
    }
  };

  const client: Quiver["client"] = (qc) => {
    qc.bind(use, null);

    // TODO
  };

  const router: Quiver["router"] = (qr) => {
    qr.bind(use);

    // TODO
  };

  const use: Quiver["use"] = (name, event, path, handler) => {
    const state = store.get(wallet.address);

    if (state === undefined) {
      throw new Error(
        `Quiver state with address "${wallet.address}" not found`,
      );
    }

    state.hooks.push({ name, event, path, handler });
  };

  return {
    use,
    client,
    router,
    start,
    stop,
  };
};
