import { createFunction } from "./createFunction.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import * as QR from "./QuiverRouter.js";
import { QuiverProvider } from "./QuiverProvider.js";
import * as QC from "./QuiverClient.js";
import { QuiverProviderOptions } from "../types/QuiverProviderOptions.js";
import { setProvider } from "../provider/setProvider.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverClient } from "./QuiverClient.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverApp } from "../types/QuiverApp.js";

export const quiver = {
  function: <Exec extends (...args: any[]) => any>(fn: Exec) => {
    const middleware = new QuiverMiddleware([[(ctx: any) => ctx]]);
    return createFunction<any, unknown, Exec>(middleware, fn);
  },

  router: <
    R extends {
      [key: string]:
        | QuiverFunction<any, any, any>
        | QuiverRouter<any, any, any>;
    },
  >(
    routes: R,
  ) => {
    const middleware = new QuiverMiddleware([[(ctx: any) => ctx]]);
    return new QR.QuiverRouter<any, unknown, any>(middleware, routes);
  },

  middleware: <CtxIn, CtxOut>(fn: (ctx: CtxIn) => CtxOut) => {
    return new QuiverMiddleware([[fn]]);
  },

  client: <App extends QuiverApp>(server: {
    namespace: string;
    address: string;
  }) => {
    return new QC.QuiverClient(server) as unknown as QuiverClient<App>;
  },

  provider: (options?: QuiverProviderOptions) => {
    const provider = new QuiverProvider(options);

    setProvider(provider);

    return provider;
  },
};
