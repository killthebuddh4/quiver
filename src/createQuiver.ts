import { QuiverOptions } from "./types/QuiverOptions.js";
import { Quiver } from "./types/Quiver.js";
import { v4 as uuid } from "uuid";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverHandler } from "./types/QuiverHandler.js";
import { Message } from "./types/Message.js";
import { createCall } from "./lib/createCall.js";
import { parseQuiverResponse } from "./lib/parseQuiverResponse.js";
import { parseQuiverRequest } from "./lib/parseQuiverRequest.js";
import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { path } from "./hooks/path.js";
import { run } from "./hooks/run.js";
import { json } from "./hooks/json.js";
import { request } from "./hooks/request.js";
import { response } from "./hooks/response.js";

export const createQuiver = (options?: QuiverOptions): Quiver => {
  const fig = options?.fig;

  if (fig === undefined) {
    throw new Error("fig is required, others aren't implemented yet");
  }

  const state: {
    sub: { unsubscribe: () => void } | null;
    // NOTE, "request routers" are identified by the PEER address,
    // while "response routers" are identified by this fig's address
    routers: Map<
      string,
      { address: string; namespace: string; handler: QuiverHandler }
    >;
    middleware: QuiverMiddleware[];
  } = {
    sub: null,
    routers: new Map(),
    middleware: options?.middleware ?? [],
  };

  const stop: Quiver["stop"] = () => {
    fig.stop();

    if (state.sub !== null) {
      state.sub.unsubscribe();
    }
  };

  const start: Quiver["start"] = async () => {
    await fig.start();

    const sub = await fig.subscribe(handler);

    state.sub = sub;

    return stop;
  };

  const isDone = (ctx: QuiverContext) => {
    return (
      ctx.return === undefined ||
      ctx.throw === undefined ||
      ctx.exit === undefined
    );
  };

  // TODO HOW DO I MANAGE THE SUBSCRIPTIONS?
  const handler = async (message: Message): QuiverContext => {
    let ctx: QuiverContext = { message };

    const pathHook = {
      before: [],
      after: [],
      catch: [],
      mw: path,
    };

    const jsonHook = {
      before: [],
      after: [],
      catch: [],
      mw: json,
    };

    const requestHook = {
      before: [],
      after: [],
      catch: [],
      mw: request,
    };

    const responseHook = {
      before: [],
      after: [],
      catch: [],
      mw: response,
    };

    ctx = await run(pathHook, ctx);

    if (isDone(ctx)) {
      return ctx;
    }

    ctx = await run(jsonHook, ctx);

    if (isDone(ctx)) {
      return ctx;
    }

    if (ctx.path === undefined) {
      throw new Error("TODO");
    }

    if (ctx.path.channel === "requests") {
      ctx = await run(requestHook, ctx);
    } else if (ctx.path.channel === "responses") {
      ctx = await run(responseHook, ctx);
    } else {
      throw new Error("TODO");
    }

    const router = Array.from(state.routers.values()).find((router) => {
      if (router.namespace !== path.value.namespace) {
        return false;
      }

      if (path.value.channel === "requests") {
        return router.address === message.conversation.peerAddress;
      }

      if (path.value.channel === "responses") {
        return router.address === fig.address;
      }
    });

    if (router === undefined) {
      for (const mw of hooks.router.error) {
        ctx = await mw(ctx);

        if (controls.check(ctx)) {
          return controls.dispatch(ctx);
        }
      }

      return dispatch.throw({
        status: "UNKNOWN_NAMESPACE",
        reason: "No router found for this message",
      });
    }

    try {
      await router.handler(ctx);
    } catch {
      for (const mw of hooks.router.error) {
        ctx = await mw(ctx);

        if (controls.check(ctx)) {
          return controls.dispatch(ctx);
        }
      }

      return dispatch.throw({
        status: "SERVER_ERROR",
        reason: "Router threw an error",
      });
    }

    for (const mw of hooks.router.after) {
      ctx = await mw(ctx);

      if (controls.check(ctx)) {
        return controls.dispatch(ctx);
      }
    }

    return;
  };

  const client: Quiver["client"] = (qc) => {
    const id = uuid();
    const call = createCall(fig.address, fig.publish);
    const bound = qc.bind(call);
    state.routers.set(id, bound);
  };

  const router: Quiver["router"] = (qr) => {
    const id = uuid();
    const bound = qr.bind();
    state.routers.set(id, {
      address: fig.address,
      ...bound,
    });
  };

  const use = (mw: QuiverMiddleware) => {
    state.middleware.push(mw);
  };

  return {
    use,
    client,
    router,
    start,
    stop,
  };
};
