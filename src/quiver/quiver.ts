import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { Maybe } from "../types/util/Maybe.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverApp } from "./QuiverApp.js";

type Root = {
  compile: (path?: string[]) => [(ctx: QuiverContext) => QuiverContext];
  exec: (path?: string[]) => Maybe<(i: any, ctx: any) => any>;
};

export const quiver = {
  function: <I, O>(fn: (i: I) => O) => {
    const middleware = new QuiverMiddleware((ctx) => ctx);
    return new QuiverFunction(middleware, fn);
  },

  router: <
    R extends {
      [key: string]: {
        compile: (path?: string[]) => [(ctx: any) => any];
        exec: (path?: string[]) => Maybe<(i: any, ctx: any) => any>;
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

  app: (root: Root) => {
    return new QuiverApp(root);
  },
};
