import { QuiverProviderOptions } from "../types/QuiverProviderOptions.js";
import { setProvider } from "../provider/setProvider.js";
import { createClient } from "./createClient.js";
import { createProvider } from "./createProvider.js";
import { createRouter } from "./createRouter.js";
import { QuiverApp } from "../types/QuiverApp.js";
import { createMiddleware } from "./createMiddleware.js";
import { QuiverClient } from "../types/QuiverClient.js";
import { QuiverClientOptions } from "../types/QuiverClientOptions.js";
import { QuiverProvider } from "../types/QuiverProvider.js";
import { Resolve } from "../types/util/Resolve.js";
import { createFunction } from "./createFunction.js";
import { QuiverContext } from "../types/QuiverContext.js";

export const createQuiver = () => {
  return {
    router: <Exec extends (ctx: any) => any>(exec: Exec) => {
      const middleware = createMiddleware<
        Resolve<Parameters<typeof exec>[0]>,
        Resolve<ReturnType<Exec>>,
        any,
        any
      >([[exec]]);

      return createRouter(middleware, {});
    },

    middleware: <F extends (ctx: any) => any>(fn: F) => {
      return createMiddleware<
        Resolve<Parameters<typeof fn>[0]>,
        Resolve<ReturnType<F>>,
        any,
        any
      >([[fn]]);
    },

    function: <Exec extends (i: any, ctx: QuiverContext) => any>(
      exec: Exec,
    ) => {
      const middleware = createMiddleware<undefined, any, any, any>([
        [(ctx: any) => ctx],
      ]);

      return createFunction(middleware, exec);
    },

    client: <App extends QuiverApp<any>>(
      provider: QuiverProvider,
      namespace: string,
      address: string,
      options?: QuiverClientOptions,
    ) => {
      return createClient({
        provider,
        server: { namespace, address },
        options,
      }) as unknown as QuiverClient<App>;
    },

    provider: (options?: QuiverProviderOptions) => {
      const provider = createProvider(options);

      setProvider(provider);

      return provider;
    },
  };
};
