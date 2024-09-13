import { Middleware } from "./createMiddleware.js";

export const createRouter = <
  CtxOut,
  R extends { [key: string]: (ctx: CtxOut) => any },
>(
  mw: Middleware<any, CtxOut, any, any>,
  routes: R,
) => {
  return {
    middleware: mw,
    routes,
  };
};
