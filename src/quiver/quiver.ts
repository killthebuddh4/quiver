import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverRouter } from "./QuiverRouter.js";

export const quiver = {
  function: <I, O>(fn: (i: I) => O) => {
    const middleware = new QuiverMiddleware((ctx) => ctx);
    return new QuiverFunction(middleware, fn);
  },

  router: <
    R extends {
      [key: string]: {
        exec: (ctx: unknown) => unknown;
      };
    },
  >(
    routes: R,
  ) => {
    const middleware = new QuiverMiddleware((ctx) => ctx);

    return new QuiverRouter(middleware, routes);
  },

  middleware: <CtxIn, CtxOut>(fn: (ctx: CtxIn) => CtxOut) => {
    return new QuiverMiddleware(fn);
  },
};
