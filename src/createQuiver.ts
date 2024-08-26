import { QuiverOptions } from "./types/QuiverOptions.js";
import { Quiver } from "./types/Quiver.js";
import { v4 as uuid } from "uuid";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverHandler } from "./types/QuiverHandler.js";
import { Message } from "./types/Message.js";
import { parseQuiverPath } from "./lib/parseQuiverPath.js";
import { createCall } from "./lib/createCall.js";
import { parseQuiverRequest } from "./lib/parseQuiverRequest.js";
import { parseQuiverResponse } from "./lib/parseQuiverResponse.js";
import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { QuiverDispatch } from "./types/QuiverDispatch.js";

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

  // TODO HOW DO I MANAGE THE SUBSCRIPTIONS?
  const handler = async (message: Message) => {
    const path = parseQuiverPath(message);

    if (!path.ok) {
      return;
    }

    let ctx: QuiverContext = {
      path: path.value,
      message,
      continue: true,
      metadata: {},
    };

    const dispatch = {} as QuiverDispatch;

    switch (path.value.channel) {
      case "requests": {
        const request = parseQuiverRequest(message);

        if (!request.ok) {
          return;
        }

        ctx.request = request.value;
      }
      case "responses": {
        const response = parseQuiverResponse(message);

        if (!response.ok) {
          return;
        }

        ctx.response = response.value;
      }
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
      return;
    }

    for (const mw of state.middleware) {
      try {
        ctx = await mw(dispatch, ctx);
      } catch {
        // TODO!
        return;
      }

      if (!ctx.continue) {
        return;
      }
    }

    router.handler(dispatch, ctx);

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
