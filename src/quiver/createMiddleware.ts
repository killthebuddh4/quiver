import { QuiverContext } from "../types/QuiverContext.js";

class Middleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  private handlers: {
    use: Array<(ctx: any) => any>;
    exit: Array<(ctx: any) => any>;
  } = { use: [], exit: [] };

  public constructor() {
    return this;
  }

  public static create<CtxIn = undefined, CtxExitIn = undefined>() {
    return new Middleware<CtxIn, undefined, CtxExitIn, undefined>();
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
    O,
  >(fn: (ctx: QuiverContext & I) => O) {
    this.handlers.use.push(fn);

    /* If neither types are defined, we initialize the types using the handler.
     * If just the input type is defined, then the new output type is the input
     * type + the handler's output type. If both are already defined, then the
     * new output type is the old output type + the handler's output type.
     * According to the above rules, every call to use extends the output using
     * the previous output type and the new handler's output type. */

    return this as unknown as CtxIn extends undefined
      ? CtxOut extends undefined
        ? Middleware<I, O, CtxExitIn, CtxExitOut> // both undefined
        : never // just out defined
      : CtxOut extends undefined //
        ? Middleware<CtxIn, CtxIn & O, CtxExitIn, CtxExitOut> // just in defined
        : Middleware<CtxIn, CtxOut & O, CtxExitIn, CtxExitOut>; // both defined
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
        ? Middleware<CtxIn, CtxOut, I, O> // both undefined
        : never // just out defined
      : CtxExitOut extends undefined //
        ? Middleware<CtxIn, CtxOut, CtxExitIn, CtxExitIn & O> // just in defined
        : Middleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut & O>; // both defined
  }
}

const mw = Middleware.create<{ user: string }, { handler: string }>()
  .use(() => {
    return {
      a: 100,
    };
  })
  .use((ctx) => {
    return {
      b: 200,
      d: ctx.user.length,
    };
  })
  .use((ctx) => {
    return {
      c: 200,
      sum: ctx.a + ctx.b,
    };
  })
  .exit((ctx) => {
    return {
      handlerLength: ctx.handler.length,
      elapsed: 100,
    };
  })
  .exit(() => {
    return {
      what: "hello",
    };
  });
