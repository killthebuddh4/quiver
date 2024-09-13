import { QuiverMiddleware } from "./QuiverMiddleware.js";

export class QuiverFunction<CtxIn, CtxOut, I, O> {
  private middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;
  private fn: (i: I, ctx: CtxOut) => O;

  public constructor(
    middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>,
    fn: (i: I, ctx: CtxOut) => O,
  ) {
    this.middleware = middleware;
    this.fn = fn;
  }

  public exec(ctx: CtxIn) {
    return this.middleware.exec(ctx);
  }
}
