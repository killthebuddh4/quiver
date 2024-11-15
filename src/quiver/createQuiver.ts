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

export const createQuiver = () => {
  const xmtp = createXmtp();

  xmtp.start();

  return {
    address: xmtp.signer.address,

    router: <Mw extends QuiverMiddleware<any, any, any, any>>(mw: Mw) => {
      return createRouter<
        Mw extends QuiverMiddleware<infer I, any, any, any> ? I : never,
        Mw extends QuiverMiddleware<any, infer O, any, any> ? O : never,
        {}
      >(xmtp, mw, {});
    },

    middleware: <F extends (ctx: any) => any>(fn: F) => {
      return createMiddleware<
        Resolve<Parameters<typeof fn>[0]>,
        Resolve<ReturnType<F>>,
        any,
        any
      >(fn);
    },

    function: <F extends (i: any, ctx: any) => any>(func: F) => {
      return createFunction<
        F extends (i: any, ctx: infer CtxIn) => { o: any; ctx: any }
          ? CtxIn
          : never,
        F extends (i: any, ctx: any) => { o: any; ctx: infer CtxOut }
          ? CtxOut
          : never,
        F
      >(func);
    },

    client: <
      R extends QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
    >(
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
