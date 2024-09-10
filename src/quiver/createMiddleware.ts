import { getUniqueId } from "../lib/getUniqueId.js";

export const createMiddleware = (name?: string) => {
  return new QuiverMiddleware<undefined, undefined, undefined, undefined>({
    name,
  });
};

export class QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  public name: string;

  private handlers: {
    use: Array<(ctx: any) => any>;
    exit: Array<(ctx: any) => any>;
  } = { use: [], exit: [] };

  public constructor(options?: { name?: string }) {
    this.name = options?.name || getUniqueId();
  }

  public narrow<I, O extends CtxIn extends undefined ? I : CtxIn>(
    fn: (ctx: I) => O,
  ) {
    this.handlers.use.unshift(fn);

    return this as unknown as QuiverMiddleware<
      I,
      CtxOut extends undefined ? O : CtxOut,
      CtxExitIn,
      CtxExitOut
    >;
  }

  public use<
    I extends CtxIn extends undefined
      ? unknown
      : CtxOut extends undefined
        ? CtxIn // just in defined
        : CtxOut, // both defined
    O extends I,
  >(fn: (ctx: I) => O) {
    this.handlers.use.push(fn);

    return this as unknown as QuiverMiddleware<
      CtxIn extends undefined ? I : CtxIn,
      O,
      CtxExitIn,
      CtxExitOut
    >;
  }

  public exit<
    I extends CtxExitIn extends undefined
      ? unknown
      : CtxExitOut extends undefined
        ? CtxExitIn // just in defined
        : CtxExitOut, // both defined
    O extends I,
  >(fn: (ctx: I) => O) {
    this.handlers.exit.push(fn);

    return this as unknown as QuiverMiddleware<
      CtxIn,
      CtxOut,
      CtxExitIn extends undefined ? I : CtxExitIn,
      O
    >;
  }
}
