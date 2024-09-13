import { Middleware } from "./createMiddleware.js";

export const createFunction = <I, O>(fn: (i: I) => O) => {
  const middleware = new Middleware<any, any, any, any>((ctx) => ctx);

  return new QuiverFunction<unknown, unknown, I, O>(middleware, fn);
};

export class QuiverFunction<CtxIn, CtxOut, I, O> {
  private middleware: Middleware<CtxIn, CtxOut, any, any>;
  private fn: (i: I, ctx: CtxOut) => O;

  public constructor(
    middleware: Middleware<CtxIn, CtxOut, any, any>,
    fn: (i: I, ctx: CtxOut) => O,
  ) {
    this.middleware = middleware;
    this.fn = fn;
  }

  public exec(ctx: CtxIn) {
    return this.middleware.exec(ctx);
  }
}
