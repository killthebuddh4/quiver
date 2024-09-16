import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverRouter } from "./QuiverRouter.js";
import * as Quiver from "../types/quiver/quiver.js";

export const quiver: Quiver.Quiver = {
  function: <Exec extends (...args: any[]) => any>(fn: Exec) => {
    const middleware = new QuiverMiddleware([[(ctx: any) => ctx]]);
    return new QuiverFunction(middleware, fn);
  },

  router: <
    R extends {
      [key: string]:
        | Quiver.Function<unknown, unknown, any>
        | Quiver.Router<unknown, unknown, any>;
    },
  >(
    routes: R,
  ) => {
    const middleware = new QuiverMiddleware([[(ctx: any) => ctx]]);

    return new QuiverRouter(middleware, routes);
  },

  middleware: <CtxIn, CtxOut>(fn: (ctx: CtxIn) => CtxOut) => {
    return new QuiverMiddleware([[fn]]);
  },

  client: <App extends Quiver.App<any>>() => {
    return {} as unknown as Quiver.Client<App>;
  },
};
