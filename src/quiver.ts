export type QuiverMiddleware<CtxIn, CtxOut> = CtxIn extends undefined
  ? () => CtxOut
  : (ctx: CtxIn) => CtxOut;

export type QuiverFunction<I, CtxIn, O> = CtxIn extends undefined
  ? (i: I) => O
  : (i: I, ctx: CtxIn) => O;

export type QuiverRouter<CtxIn> = {
  middleware?: QuiverMiddleware<CtxIn, any>;
  routes: {
    [key: string]: QuiverRouter<any> | QuiverRoute<any>;
  };
};

export type QuiverRoute<CtxIn> = {
  middleware?: QuiverMiddleware<CtxIn, any>;
  route: QuiverFunction<any, CtxIn, any>;
};

export const createMiddleware = <F extends QuiverMiddleware<any, any>>(
  f: F,
): F => {
  return f;
};

const createRoute = <
  CtxOut,
  F extends QuiverFunction<any, CtxOut, any> = QuiverFunction<any, CtxOut, any>,
  M extends QuiverMiddleware<any, CtxOut> = QuiverMiddleware<unknown, CtxOut>,
>(
  route: F,
  middleware: M,
) => {
  return {
    middleware,
    route,
  };
};

const createRouter = <
  R extends {
    [key: string]: QuiverRouter<ReturnType<M>> | QuiverRoute<ReturnType<M>>;
  },
  M extends QuiverMiddleware<any, any> = QuiverMiddleware<unknown, unknown>,
>(
  routes: R,
  middleware: M,
) => {
  return {
    middleware,
    routes,
  };
};

// Why does createRouter inside createRouter break the type inference?

const math = createRouter(
  {
    add: createRoute(
      (i: string) => i,
      (args: { a: number; b: number }) => args,
    ),
    sub: createRoute<{ a: number; b: number }>(
      (i, args: { a: number; b: number }) => args.a - args.b,
      (args: { a: number; b: number }) => args,
    ),
  },
  (args: { a: number; b: number }) => args,
);
const hello = createRoute<{ name: string }>(
  (i: any, args: { name: string }) => `Hello, ${args.name}, ${i}!`,
  (args) => args,
);

const m = hello.middleware({ name: "world" });
const v = hello.route(null, m);

const pub = createRouter(
  {
    hello: createRoute(
      (i, args: { name: number }) => `Hello, ${args.name}!`,
      (args: { name: number } | { x: null }) => args,
    ),
  },
  (args: { name: number }) => args,
);

const app = createRouter(
  {
    math,
    pub,
  },
  (args: { name: string }) => args,
);
