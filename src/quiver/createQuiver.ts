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

type SafeExtender<X, Y, F> = F extends (ctx: infer I) => infer O
  ? SafeExtension<X, I> extends never
    ? never
    : SafeExtension<Y, O> extends never
      ? never
      : F
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

  ): SafeExtension<CtxIn, I> extends never
    ? never
    : SafeExtension<CtxOut, O> extends never
      ? never
      : () => Middleware<I & CtxIn, O & CtxOut, CtxExitIn, CtxExitOut> {
*/

type H = {
  use: any[];
  exit: any[];
  extend: any[];
  next: any[];
};

class Middleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  private handlers: H = { extend: [], use: [], exit: [], next: [] };

  public constructor(handlers: H) {
    this.handlers = handlers;
  }

  public static create<I, O>(fn: (ctx: I) => O) {
    return new Middleware<I, O, never, never>({
      use: [fn],
      exit: [],
      extend: [],
      next: [],
    });
  }

  public extend<F>(fn: SafeExtender<CtxIn, CtxOut, F>) {
    return new Middleware<
      F extends (ctx: infer I) => any ? I & CtxIn : never,
      F extends (ctx: any) => infer O ? O & CtxOut : never,
      CtxExitIn,
      CtxExitOut
    >({
      use: [],
      exit: [],
      extend: [fn],
      next: [],
    });
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

const mwa = Middleware.create((ctx: { a: null }) => {
  return {
    ...ctx,
    b: "heyllo",
  };
});

mwa.extend((ctx: { b: string }) => {
  return {
    ...ctx,
    a: "hello",
    b: "hey",
  };
});

// const mwa = Middleware.create((ctx: { a: number }) => {
//   return { b: ctx.a };
// }).extend

// // .extend((ctx: { a: string }) => {
// //   return { ...ctx };
// // });

// const mwb = Middleware.create((ctx: { b: number; c: "hey" }) => {
//   return {
//     d: ctx.b,
//   };
// });

/* When is type I compatible with type CtxIn?

- when they don't share any keys
- when they share some keys, but the values are compatible



*/

// Utility type to check if two types share any keys
type NoSharedKeys<T, U> = keyof T & keyof U extends never ? T : never;

// Define a function with the constraint that T and U do not share any keys
function someFunction<T extends object, U extends object>(
  t: NoSharedKeys<T, U>,
  u: U,
): typeof t {
  return t;
}

// Example usage:

type A = { foo: string; bar: number };
type B = { baz: boolean };

// Works because A and B share no keys

const x = someFunction({ foo: "hello", bar: 42 }, { baz: true });

// Error because A and C share the 'foo' key
type C = { foo: number };
someFunction({ foo: "hello", bar: 42 }, { foo: 100 }); // TypeScript error
