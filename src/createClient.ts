import { QuiverClient } from "./types/QuiverClient.js";
import { QuiverClientOptions } from "./types/QuiverClientOptions.js";
import { QuiverCall } from "./types/QuiverCall.js";
import { QuiverResponse } from "./types/QuiverResponse.js";
import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { QuiverApiSpec } from "./types/QuiverApiSpec.js";
import { QuiverClientContext } from "./types/QuiverClientContext.js";

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

  const handler = async (context: QuiverClientContext) => {
    const resolve = state.queue.get(context.response.id);

    if (resolve === undefined) {
      return;
    }

    state.queue.delete(context.response.id);

    resolve(context.response);
  };

  const client = {} as QuiverClient<typeof api>;

  for (const name of Object.keys(api)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any)[name] = async (
      input: ReturnType<(typeof api)[typeof name]["input"]>,
    ) => {
      if (state.call === null) {
        throw new Error("Client hasn't been bound to Quiver yet");
      }

      const message = await state.call(address, namespace, {
        function: name,
        arguments: input,
      });

      return new Promise((resolve) => {
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
