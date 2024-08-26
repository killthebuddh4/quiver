import { z } from "zod";
import { QuiverClient } from "./types/QuiverClient.js";
import { QuiverClientOptions } from "./types/QuiverClientOptions.js";
import { QuiverCall } from "./types/QuiverCall.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverResponse } from "./types/QuiverResponse.js";
import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { QuiverApiSpec } from "./types/QuiverApiSpec.js";

export const createClient = <Api extends QuiverApiSpec>(
  address: string,
  namespace: string,
  api: Api,
  options?: QuiverClientOptions,
): QuiverClient<typeof api> => {
  const state: {
    middleware: QuiverMiddleware[];
    call: QuiverCall | null;
    queue: Map<string, (response: QuiverResponse<unknown>) => void>;
  } = {
    middleware: options?.middleware ?? [],
    call: null,
    queue: new Map(),
  };

  const handler = async (context: QuiverContext) => {
    console.log(`Client ${namespace} received a response`);

    if (context.metadata?.response === undefined) {
      console.error(
        `No response found in context (probably because of a buggy middleware)`,
      );
      return;
    }

    const response = context.metadata.response as QuiverResponse<unknown>;

    console.log(`Response is ${JSON.stringify(response)}`);

    const resolve = state.queue.get(response.id);

    if (resolve === undefined) {
      // TODO Handle errors
      console.error(`No resolve function found for response ${response.id}`);
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
      if (state.call === null) {
        throw new Error("Client hasn't been bound to Quiver yet");
      }

      const message = await state.call(address, namespace, {
        function: name,
        arguments: input,
      });

      return new Promise((resolve) => {
        console.log(`Putting message ${message.id} in the queue`);
        state.queue.set(message.id, resolve);
      });
    };
  }

  const use = (middleware: QuiverMiddleware) => {
    state.middleware.push(middleware);
  };

  const bind = (call: QuiverCall) => {
    state.call = call;

    return {
      namespace,
      address,
      handler,
    };
  };

  return { ...client, use, bind } as QuiverClient<typeof api>;
};
