import { QuiverOptions } from "./types/QuiverOptions.js";
import { Quiver } from "./types/Quiver.js";
import { v4 as uuid } from "uuid";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverHandler } from "./types/QuiverHandler.js";
import { Message } from "./types/Message.js";
import { parsePath } from "./lib/parsePath.js";
import { createReturn } from "./lib/createReturn.js";
import { createThrow } from "./lib/createThrow.js";
import { QuiverClientHandler } from "./types/QuiverClientHandler.js";
import { createCall } from "./lib/createCall.js";
import { parseQuiverRequest } from "./lib/parseQuiverRequest.js";
import { parseQuiverResponse } from "./lib/parseQuiverResponse.js";
import { QuiverClientContext } from "./types/QuiverClientContext.js";

const VERSION = "0.0.1";

export const createQuiver = (options?: QuiverOptions): Quiver => {
  const fig = options?.fig;

  if (fig === undefined) {
    throw new Error("fig is required, others aren't implemented yet");
  }

  const state: {
    sub: { unsubscribe: () => void } | null;
    routers: Map<string, { namespace: string; handler: QuiverHandler }>;
    clients: Map<
      string,
      { address: string; namespace: string; handler: QuiverClientHandler }
    >;
  } = {
    sub: null,
    routers: new Map(),
    clients: new Map(),
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
  const handler = (message: Message) => {
    const path = parsePath(message.conversation.context?.conversationId);

    if (!path.ok) {
      return;
    }

    if (path.value.version !== VERSION) {
      return;
    }

    if (path.value.address !== message.senderAddress) {
      return;
    }

    switch (path.value.source) {
      case "client": {
        const router = Array.from(state.routers.values()).find((router) => {
          return path.value.namespace === router.namespace;
        });

        if (router === undefined) {
          return;
        }

        const request = parseQuiverRequest(message);

        if (!request.ok) {
          return;
        }

        const context: QuiverContext = {
          return: createReturn(fig.address, message, fig.publish),
          throw: createThrow(fig.address, message, fig.publish),
          message,
          request: request.value,
          metadata: {},
        };

        router.handler(context);

        return;
      }
      case "router": {
        const client = Array.from(state.clients.values()).find((client) => {
          return (
            path.value.namespace === client.namespace &&
            path.value.address === client.address
          );
        });

        if (client === undefined) {
          return;
        }

        const response = parseQuiverResponse(message);

        if (!response.ok) {
          return;
        }

        const context: QuiverClientContext = {
          message,
          response: response.value,
          metadata: {},
        };

        client.handler(context);

        return;
      }
    }
  };

  const client: Quiver["client"] = (qc) => {
    const id = uuid();
    const call = createCall(fig.address, fig.publish);
    const bound = qc.bind(call);
    state.clients.set(id, bound);
  };

  const router: Quiver["router"] = (qr) => {
    const id = uuid();
    const bound = qr.bind();
    state.routers.set(id, bound);
  };

  return {
    client,
    router,
    start,
    stop,
  };
};
