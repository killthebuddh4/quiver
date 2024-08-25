import { z } from "zod";
import { QuiverClient } from "./types/QuiverClient.js";
import { QuiverClientOptions } from "./types/QuiverClientOptions.js";
import { QuiverRequest } from "./types/QuiverRequest.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverResponse } from "./types/QuiverResponse.js";
import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { QuiverApiSpec } from "./types/QuiverApiSpec.js";
import { Fig } from "./types/Fig.js";

export const createClient = <Api extends QuiverApiSpec>(
  address: string,
  namespace: string,
  api: Api,
  options?: QuiverClientOptions,
): QuiverClient<typeof api> => {
  const state: {
    middleware: QuiverMiddleware[];
    publish: Fig["publish"] | null;
    queue: Map<string, (response: QuiverResponse<unknown>) => void>;
  } = {
    middleware: options?.middleware ?? [],
    publish: null,
    queue: new Map(),
  };

  const handler = async (context: QuiverContext) => {
    if (context.metadata?.response === undefined) {
      // TODO
      return;
    }

    const response = context.metadata.response as QuiverResponse<unknown>;

    const resolve = state.queue.get(context.message.id);

    if (resolve === undefined) {
      // TODO Handle errors
      return;
    }

    resolve(response);
  };

  const client = {} as QuiverClient<typeof api>;

  for (const name of Object.keys(api)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any)[name] = async (
      input: z.infer<(typeof api)[typeof name]["input"]>,
    ) => {
      if (state.publish === null) {
        throw new Error("Client hasn't been bound to Quiver yet");
      }

      const request: QuiverRequest = {
        function: name,
        arguments: input,
      };

      let str: string;
      try {
        str = JSON.stringify(request);
      } catch {
        return {
          ok: false,
          code: "INPUT_SERIALIZATION_FAILED",
          response: null,
        };
      }

      const message = await state.publish({
        conversation: {
          peerAddress: address,
          context: {
            conversationId: `quiver/0.0.1/client/${namespace}/${name}`,
            metadata: {},
          },
        },
        content: str,
      });

      return new Promise((resolve) => {
        state.queue.set(message.id, resolve);
      });
    };
  }

  const use = (middleware: QuiverMiddleware) => {
    state.middleware.push(middleware);
  };

  const bind = (publish: Fig["publish"]) => {
    state.publish = publish;

    return {
      namespace,
      address,
      handler,
    };
  };

  return { ...client, use, bind } as QuiverClient<typeof api>;
};
