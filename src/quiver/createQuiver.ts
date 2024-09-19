import { createFunction } from "./createFunction.js";
import { QuiverProviderOptions } from "../types/QuiverProviderOptions.js";
import { setProvider } from "../provider/setProvider.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { createClient } from "./createClient.js";
import { createProvider } from "./createProvider.js";
import { createRouter } from "./createRouter.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverApp } from "../types/QuiverApp.js";
import { createMiddleware } from "./createMiddleware.js";
import { QuiverClient } from "../types/QuiverClient.js";
import { QuiverClientOptions } from "../types/QuiverClientOptions.js";
import { QuiverProvider } from "../types/QuiverProvider.js";
import { Resolve } from "../types/util/Resolve.js";

export const createQuiver = () => {
  return {
    function: <Exec extends (...args: any[]) => any>(fn: Exec) => {
      const middleware = createMiddleware([[(ctx: any) => ctx]]);
      return createFunction<any, unknown, Exec>(middleware, fn);
    },

    router: <
      Routes extends {
        [key: string]:
          | QuiverFunction<any, any, any>
          | QuiverRouter<any, any, any>;
      },
    >(
      routes: Routes,
    ) => {
      const middleware = createMiddleware([[(ctx: any) => ctx]]);
      return createRouter<any, unknown, Routes>(middleware, routes);
    },

    /*
     What are the cases we care about?

    - middleware that has no input requirements
    - middleware that has input requirements

     */
    middleware: <F extends (ctx: any) => any>(fn: F) => {
      return createMiddleware<
        Resolve<Parameters<typeof fn>[0]>,
        Resolve<ReturnType<F>>,
        any,
        any
      >([[fn]]);
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
