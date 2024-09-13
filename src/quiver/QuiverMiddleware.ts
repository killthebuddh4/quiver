import { ParallelExtension } from "../types/util/ParallelExtension.js";
import { SerialExtension } from "../types/util/SerialExtension.js";
import { Resolve } from "../types/util/Resolve.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { Maybe } from "../types/util/Maybe.js";

export class QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  private handler: (ctx: CtxIn) => CtxOut;

  public constructor(handler: (ctx: CtxIn) => CtxOut) {
    this.handler = handler;
  }

  public parallel<F>(
    fn: CtxIn extends never ? never : ParallelExtension<CtxIn, CtxOut, F>,
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

    return new QuiverMiddleware<
      Resolve<F extends (ctx: infer I) => any ? I & CtxIn : never>,
      Resolve<F extends (ctx: any) => infer O ? O & CtxOut : never>,
      CtxExitIn,
      CtxExitOut
    >(handler as any);
  }

  public serial<F>(
    fn: CtxIn extends never ? never : SerialExtension<CtxOut, F>,
  ) {
    const handler = (
      ctx: F extends (ctx: infer I) => any ? Resolve<I & CtxIn> : never,
    ): F extends (ctx: any) => infer O ? Resolve<O & CtxOut> : never => {
      // NOTE:
      // We know that CtxIn > CtxOut
      // We know that F is a SerialExtension of CtxOut.
      // (*) This means that any CtxOut ~> I.
      // The keys in I that aren't covered by (*) are also not in CtxIn because CtxIn > CtxOut.
      // Therefore, I & CtxOut adds keys that will be ignored by this.handler.
      const hctx = this.handler(ctx as any);
      const sctx = fn(hctx);

      return {
        ...hctx,
        ...(sctx as any),
      } as F extends (ctx: any) => infer O ? Resolve<O & CtxOut> : never;
    };

    return new QuiverMiddleware<
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
        compile: (path?: string[]) => Array<(ctx: any) => any>;
        exec: (path?: string[]) => Maybe<(i: any, ctx: any) => any>;
      };
    },
  >(routes: R) {
    return new QuiverRouter(this, routes);
  }
}
