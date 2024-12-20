import { createClient } from "../client/createClient.js";
import { createXmtp } from "./createXmtp.js";
import { createRouter } from "../router/createRouter.js";
import { createMiddleware } from "../middleware/createMiddleware.js";
import { QuiverClient } from "../types/QuiverClient.js";
import { QuiverClientOptions } from "../types/QuiverClientOptions.js";
import { Resolve } from "../types/util/Resolve.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { RootRouter } from "../types/router/RootRouter.js";
import { serve } from "../router/serve.js";
import { RootFn } from "../types/function/RootFn.js";
import { QuiverServerOptions } from "../types/QuiverServerOptions.js";

export const createQuiver = (options?: { xmtp?: QuiverXmtp }) => {
  /* TODO. We need to design the XMTP initialization API. See dev notes from
   * 2024-11-16. */
  let xmtp: QuiverXmtp;
  if (options?.xmtp !== undefined) {
    xmtp = options.xmtp;
  } else {
    xmtp = createXmtp();
  }

  (async () => {
    try {
      await xmtp.start();
    } catch (err) {
      throw err;
    }
  })();

  return {
    address: xmtp.signer.address,

    kill: () => {
      return xmtp.stop();
    },

    serve: <Root extends QuiverRouter<any, any, any> | QuiverFunction<any>>(
      root: RootRouter<Root> | RootFn<Root>,
      options?: QuiverServerOptions,
    ) => {
      return serve(xmtp, root, options);
    },

    router: () => {
      return createRouter<undefined, undefined, {}>(
        xmtp,
        createMiddleware(() => {}),
        {},
      );
    },

    middleware: <F extends (ctx: any) => any>(fn: F) => {
      return createMiddleware<
        Resolve<Parameters<typeof fn>[0]>,
        Resolve<ReturnType<F> extends void ? undefined : ReturnType<F>>,
        any,
        any
      >(fn);
    },

    client: <R extends QuiverRouter<any, any, any> | QuiverFunction<any>>(
      address: string,
      options?: QuiverClientOptions,
    ) => {
      return createClient({
        xmtp,
        server: { address },
        options,
      }) as unknown as QuiverClient<R>;
    },
  };
};
