import { MiddlewareParallelExtension } from "../types/MiddlewareParallelExtension.js";
import { MiddlewareSerialExtension } from "../types/MiddlewareSerialExtension.js";
import { Resolve } from "../types/Resolve.js";
import { QuiverFunction } from "./createFunction.js";
import { QuiverRouter } from "./createRouter.js";

export const createMiddleware = <CtxIn, CtxOut>(fn: (ctx: CtxIn) => CtxOut) => {
  return new Middleware<CtxIn, CtxOut, never, never>(fn);
};

export class Middleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  private handler: (ctx: CtxIn) => CtxOut;

  public constructor(handler: (ctx: CtxIn) => CtxOut) {
    this.handler = handler;
  }

  public parallel<F>(
    fn: CtxIn extends never
      ? never
      : MiddlewareParallelExtension<CtxIn, CtxOut, F>,
  ) {
    const handler = (
      ctx: F extends (ctx: infer I) => any ? Resolve<I & CtxIn> : never,
    ): F extends (ctx: any) => infer O ? Resolve<O & CtxOut> : never => {
      const hctx = this.handler(ctx);
      const pctx = fn(hctx);

      return {
        ...hctx,
        ...(pctx as any),
      } as F extends (ctx: any) => infer O ? Resolve<O & CtxOut> : never;
    };

    return new Middleware<
      Resolve<F extends (ctx: infer I) => any ? I & CtxIn : never>,
      Resolve<F extends (ctx: any) => infer O ? O & CtxOut : never>,
      CtxExitIn,
      CtxExitOut
    >(handler as any);
  }

  public serial<F>(
    fn: CtxIn extends never ? never : MiddlewareSerialExtension<CtxOut, F>,
  ) {
    const handler = (
      ctx: F extends (ctx: infer I) => any ? Resolve<I & CtxIn> : never,
    ): F extends (ctx: any) => infer O ? Resolve<O & CtxOut> : never => {
      const hctx = this.handler(ctx);
      const sctx = fn(hctx);

      return {
        ...hctx,
        ...(sctx as any),
      } as F extends (ctx: any) => infer O ? Resolve<O & CtxOut> : never;
    };

    return new Middleware<
      Resolve<
        F extends (ctx: infer I) => any ? Omit<I, keyof CtxIn> & CtxIn : never
      >,
      Resolve<F extends (ctx: any) => infer O ? O & CtxOut : never>,
      CtxExitIn,
      CtxExitOut
    >(handler as any);
  }

  public compile() {
    return this.handler;
  }

  public exec(ctx: CtxIn) {
    return this.handler(ctx);
  }

  public function<I, O>(fn: (i: I) => O) {
    return new QuiverFunction<CtxIn, CtxOut, I, O>(this, fn);
  }

  public router<
    R extends {
      [key: string]: {
        exec: (ctx: CtxOut) => any;
      };
    },
  >(routes: R) {
    return new QuiverRouter(this, routes);
  }
}
