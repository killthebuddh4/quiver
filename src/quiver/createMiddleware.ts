import { MiddlewareParallelExtension } from "../types/MiddlewareParallelExtension.js";
import { MiddlewareSerialExtension } from "../types/MiddlewareSerialExtension.js";
import { Resolve } from "../types/Resolve.js";

export const createMiddleware = () => {
  return new Middleware<never, never, never, never>({
    use: [],
    parallel: [],
    serial: [],
  });
};

type H = {
  use: any[];
  parallel: any[];
  serial: any[];
};

export class Middleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  private handlers: H = { use: [], parallel: [], serial: [] };

  public constructor(handlers: H) {
    this.handlers = handlers;
  }

  public use<I, O>(fn: (ctx: I) => O) {
    return new Middleware<I, O, never, never>({
      use: [fn],
      parallel: [],
      serial: [],
    });
  }

  public parallel<F>(
    fn: CtxIn extends never
      ? never
      : MiddlewareParallelExtension<CtxIn, CtxOut, F>,
  ) {
    return new Middleware<
      Resolve<F extends (ctx: infer I) => any ? I & CtxIn : never>,
      Resolve<F extends (ctx: any) => infer O ? O & CtxOut : never>,
      CtxExitIn,
      CtxExitOut
    >({
      ...this.handlers,
      parallel: [...this.handlers.parallel, fn],
    });
  }

  public serial<F>(
    fn: CtxIn extends never ? never : MiddlewareSerialExtension<CtxOut, F>,
  ) {
    return new Middleware<
      Resolve<
        F extends (ctx: infer I) => any ? Omit<I, keyof CtxIn> & CtxIn : never
      >,
      Resolve<F extends (ctx: any) => infer O ? O & CtxOut : never>,
      CtxExitIn,
      CtxExitOut
    >({
      ...this.handlers,
      serial: [...this.handlers.serial, fn],
    });
  }
}
