import { createClient } from "./createClient.js";
import { createXmtp } from "./createXmtp.js";
import { createRouter } from "./createRouter.js";
import { createMiddleware } from "./createMiddleware.js";
import { QuiverClient } from "../types/QuiverClient.js";
import { QuiverClientOptions } from "../types/QuiverClientOptions.js";
import { Resolve } from "../types/util/Resolve.js";
import { createFunction } from "./createFunction.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { RootRouter } from "../types/router/RootRouter.js";
import { serve } from "../router/serve.js";

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

    serve: <Router>(namespace: string, router: RootRouter<Router>) => {
      return serve(namespace, xmtp, router);
    },

    router: <Mw extends QuiverMiddleware<any, any, any, any>>(mw: Mw) => {
      return createRouter<
        Mw extends QuiverMiddleware<infer I, any, any, any> ? I : never,
        Mw extends QuiverMiddleware<any, infer O, any, any> ? O : never,
        {}
      >(xmtp, mw, {});
    },

    middleware: <F extends (ctx: any) => any>(fn: F) => {
      return createMiddleware<
        Resolve<
          Parameters<typeof fn>[0] extends undefined
            ? Record<string, any>
            : Parameters<typeof fn>[0]
        >,
        Resolve<ReturnType<F>>,
        any,
        any
      >(fn);
    },

    function: <F extends (i: any, ctx: any) => any>(func: F) => {
      return createFunction<F>(func);
    },

    client: <R extends QuiverRouter<any, any, any> | QuiverFunction<any, any>>(
      namespace: string,
      address: string,
      options?: QuiverClientOptions,
    ) => {
      return createClient({
        xmtp,
        server: { namespace, address },
        options,
      }) as unknown as QuiverClient<R>;
    },
  };
};
