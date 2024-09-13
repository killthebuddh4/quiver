import { Middleware } from "./createMiddleware.js";

export const createRouter = <
  R extends {
    [key: string]: {
      exec: (ctx: unknown) => unknown;
    };
  },
>(
  routes: R,
) => {
  const middleware = new Middleware<unknown, unknown, any, any>((ctx) => ctx);

  return new QuiverRouter<unknown, unknown, R>(middleware, routes);
};

export class QuiverRouter<CtxIn, CtxOut, R> {
  private middleware: Middleware<CtxIn, CtxOut, any, any>;
  private routes: R;

  public constructor(
    middleware: Middleware<CtxIn, CtxOut, any, any>,
    routes: R,
  ) {
    this.middleware = middleware;
    this.routes = routes;
  }
}
