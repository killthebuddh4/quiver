import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverProvider } from "./QuiverProvider.js";
import { QuiverClient } from "./QuiverClient.js";
import * as Quiver from "../types/quiver/quiver.js";

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

  client: <
    Server extends
      | Quiver.Router<any, any, any>
      | Quiver.Function<any, any, any>,
  >(server: {
    namespace: string;
    address: string;
  }) => {
    return new QuiverClient(server) as unknown as Quiver.Client<Server>;
  },

  provider: () => {
    return new QuiverProvider();
  },
};
