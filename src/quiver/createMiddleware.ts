import { QuiverContext } from "../types/QuiverContext.js";
import { getUniqueId } from "../lib/getUniqueId.js";

export const createMiddleware = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  use?: (ctx: CtxIn) => CtxOut,
  exit?: (ctx: CtxExitIn) => CtxExitOut,
  name?: string,
) => {
  return new QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>({
    use,
    exit,
    name,
  });
};

export class QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  public name: string;
  private handlers: {
    use: Array<(ctx: any) => any>;
    exit: Array<(ctx: any) => any>;
  } = { use: [], exit: [] };

  public constructor(options?: {
    use?: (ctx: any) => any;
    exit?: (ctx: any) => any;
    name?: string;
  }) {
    this.name = options?.name || getUniqueId();
    if (options?.use) this.handlers.use.push(options.use);
    if (options?.exit) this.handlers.exit.push(options.exit);
  }

  public use<
    /* If neither the input type nor the output type are defined, then the
     * handler's input type is whatever. If the input type is defined and the
     * output type is not defined, then the handler's input type is the input
     * type. If both an input and an output type are defined, then the handler's
     * input type is the output type. It should not be possible for an output
     * type to be defined without an input type. */
    I extends CtxIn extends undefined
      ? CtxOut extends undefined
        ? unknown // both undefined
        : never // just out defined
      : CtxOut extends undefined
        ? CtxIn // just in defined
        : CtxOut, // both defined
    O extends I,
  >(fn: (ctx: I) => O) {
    this.handlers.use.push(fn);

    /* If neither types are defined, we initialize the types using the handler.
     * If just the input type is defined, then the new output type is the input
     * type + the handler's output type. If both are already defined, then the
     * new output type is the old output type + the handler's output type.
     * According to the above rules, every call to use extends the output using
     * the previous output type and the new handler's output type. */

    return this as unknown as CtxIn extends undefined
      ? CtxOut extends undefined
        ? QuiverMiddleware<I, O, CtxExitIn, CtxExitOut> // both undefined
        : never // just out defined
      : CtxOut extends undefined //
        ? QuiverMiddleware<CtxIn, O, CtxExitIn, CtxExitOut> // just in defined
        : QuiverMiddleware<CtxIn, O, CtxExitIn, CtxExitOut>; // both defined
  }

  /* The logic here is identical to the use method. The difference between the
   * two will only appear in how they're used (at least for now). */
  public exit<
    I extends CtxExitIn extends undefined
      ? CtxExitOut extends undefined
        ? unknown // both undefined
        : never // just out defined
      : CtxExitOut extends undefined
        ? CtxExitIn // just in defined
        : CtxExitOut, // both defined
    O,
  >(fn: (ctx: QuiverContext & I) => O) {
    this.handlers.use.push(fn);

    return this as unknown as CtxExitIn extends undefined
      ? CtxExitOut extends undefined
        ? QuiverMiddleware<CtxIn, CtxOut, I, O> // both undefined
        : never // just out defined
      : CtxExitOut extends undefined //
        ? QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitIn & O> // just in defined
        : QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut & O>; // both defined
  }
}
