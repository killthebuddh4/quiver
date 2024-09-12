type QuiverFunction<Ctx, I, O> = (i: I, ctx: Ctx) => O;

type QuiverMiddleware<CtxIn, CtxOut> = {
  use: (ctx: CtxIn) => CtxOut;
};

type QuiverRoute<CtxIn, CtxOut> = {
  middleware: QuiverMiddleware<CtxIn, CtxOut>;
  fn: QuiverFunction<any, CtxOut, any>;
};

type QuiverRouter<CtxIn, CtxOut> = {
  middleware: QuiverMiddleware<CtxIn, CtxOut>;
  routes: {
    [key: string]:
      | QuiverRouter<CtxOut, any>
      | QuiverRoute<CtxOut, any>
      | QuiverFunction<CtxOut, any, any>;
  };
};

type Left<X, Y> = { [K in keyof X & keyof Y]: X[K] };

type Right<X, Y> = { [K in keyof X & keyof Y]: Y[K] };

type SafeExtension<X, Y> =
  Extract<keyof X, keyof Y> extends never
    ? Y
    : Right<X, Y> extends Left<X, Y>
      ? Y
      : never;

/*

This is like my spec.

logged

{
  public: {
    describe: //
    join: //
}

admin: {
  destroy: //
}

members: {
  post: //
}

*/

type H = {
  use: Array<(ctx: any) => any>;
  exit: Array<(ctx: any) => any>;
  extend: Array<(ctx: any) => any>;
  next: Array<Middleware<any, any, any, any>>;
};

class Middleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  private handlers: H = { extend: [], use: [], exit: [], next: [] };

  public constructor(handlers: H) {
    this.handlers = handlers;
  }

  public static create<I, O>(fn: (ctx: I) => O) {
    return new Middleware<I, O, undefined, undefined>({
      use: [fn],
      exit: [],
      extend: [],
      next: [],
    });
  }

  public extend<I, O>(
    fn: (ctx: SafeExtension<CtxIn, I>) => SafeExtension<CtxOut, O>,
  ) {
    this.handlers.extend.push(fn);

    return this as unknown as Middleware<
      CtxIn extends undefined ? I : I & CtxIn,
      CtxOut extends undefined ? O : O & CtxOut,
      CtxExitIn,
      CtxExitOut
    >;
  }

  public test<T extends CtxOut>(v: T) {
    console.log(v);
  }

  public pipe<Next>(
    next: Next extends Middleware<infer I, any, any, any>
      ? SafeExtension<CtxOut, I> extends never
        ? never
        : Next
      : never,
  ) {
    this.handlers.next.push(next);

    return this as Middleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>;
  }
}

const mwa = Middleware.create((ctx: { a: number }) => {
  return { b: ctx.a };
}).extend(() => {
  return {
    c: "hey",
  };
});

const mwb = Middleware.create((ctx: { b: number; c: "hey" }) => {
  return {
    d: ctx.b,
  };
});

const mwc = mwa.pipe(mwb);
