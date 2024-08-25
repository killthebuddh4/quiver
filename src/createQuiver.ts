import { QuiverOptions } from "./types/QuiverOptions.js";
import { Quiver } from "./types/Quiver.js";
import { v4 as uuid } from "uuid";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverHandler } from "./types/QuiverHandler.js";
import { Message } from "./types/Message.js";
import { parseQuiverPath } from "./lib/parseQuiverPath.js";
import { createReturn } from "./lib/createReturn.js";
import { createThrow } from "./lib/createThrow.js";
import { parseRequest } from "./lib/parseRequest.js";
import { parseResponse } from "./lib/parseResponse.js";

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
      { address: string; namespace: string; handler: QuiverHandler }
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
    const path = parseQuiverPath(message.conversation.context?.conversationId);

    if (!path.ok) {
      console.error(
        `Received invalid path: ${message.conversation.context?.conversationId}`,
      );
      return;
    }

    if (path.value.version !== VERSION) {
      console.error(
        `Received invalid path: ${message.conversation.context?.conversationId}`,
      );
      // TODO - How do we handle incompatible versions?
      return;
    }

    if (path.value.address !== message.senderAddress) {
      console.error(
        `Received invalid path: ${message.conversation.context?.conversationId}`,
      );
      // TODO - How do we handle mismatched addresses?
      return;
    }

    switch (path.value.source) {
      case "client": {
        // TODO how to handle addresses?
        const router = Array.from(state.routers.values()).find((router) => {
          return path.value.namespace === router.namespace;
        });

        if (router === undefined) {
          // How do we handle not finding a router?
          return;
        }

        const request = parseRequest(message);

        if (!request.ok) {
          // How do we handle invalid requests?
          return;
        }

        const context: QuiverContext = {
          return: createReturn(message, fig.publish),
          throw: createThrow(message, fig.publish),
          message,
          metadata: { request },
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
          // How do we handle not finding a client?
          return;
        }

        const response = parseResponse(message);

        if (!response.ok) {
          // How do we handle invalid responses?
          return;
        }

        const context: QuiverContext = {
          return: createReturn(message, fig.publish),
          throw: createThrow(message, fig.publish),
          message,
          metadata: { response },
        };

        client.handler(context);

        return;
      }
    }
  };

  const client: Quiver["client"] = (qc) => {
    const id = uuid();

    const bound = qc.bind(fig.publish);

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
