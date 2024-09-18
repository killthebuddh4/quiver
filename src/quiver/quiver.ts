import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverProvider } from "./QuiverProvider.js";
import { QuiverClient } from "./QuiverClient.js";
import * as Quiver from "../types/quiver/quiver.js";
import { QuiverProviderOptions } from "../types/options/QuiverProviderOptions.js";
import { setProvider } from "../provider/setProvider.js";

export const quiver: Quiver.Quiver = {
  function: <Exec extends (...args: any[]) => any>(fn: Exec) => {
    const middleware = new QuiverMiddleware([[(ctx: any) => ctx]]);
    return new QuiverFunction<any, unknown, Exec>(middleware, fn);
  },

  router: <
    R extends {
      [key: string]:
        | Quiver.Function<any, any, any>
        | Quiver.Router<any, any, any>;
    },
  >(
    routes: R,
  ) => {
    const middleware = new QuiverMiddleware([[(ctx: any) => ctx]]);
    return new QuiverRouter<any, unknown, any>(middleware, routes);
  },

  middleware: <CtxIn, CtxOut>(fn: (ctx: CtxIn) => CtxOut) => {
    return new QuiverMiddleware([[fn]]);
  },

  client: <App extends Quiver.App>(
    address: string,
    server: {
      namespace: string;
      address: string;
    },
  ) => {
    return new QuiverClient(address, server) as unknown as Quiver.Client<App>;
  },

  provider: (options?: QuiverProviderOptions) => {
    const provider = new QuiverProvider(options);

    setProvider(provider);

    return provider;
  },
};
