import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { Maybe } from "../types/util/Maybe.js";

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

  public typeguard(ctx: CtxIn): never {
    throw new Error(`This function should never be called ${ctx}`);
  }

  public compile(): Array<(ctx: CtxIn) => CtxOut> {
    return [this.middleware.compile()];
  }

  public exec(): Maybe<typeof this.fn> {
    return { ok: true, value: this.fn };
  }
}
