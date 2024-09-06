export type QuiverMiddleware<CtxIn, CtxOut> = (ctx: CtxIn) => CtxOut;

export type QuiverFunction<I, CtxIn, O> = (i: I, ctx: CtxIn) => O;

export type QuiverRouter<CtxIn, CtxOut> = {
  middleware: QuiverMiddleware<CtxIn, CtxOut>;
  routes: {
    [key: string]: QuiverRouter<CtxOut, any> | QuiverRoute<CtxOut, any>;
  };
};

export type QuiverRoute<CtxIn, CtxOut> = {
  middleware: QuiverMiddleware<CtxIn, CtxOut>;
  fn: QuiverFunction<any, CtxOut, any>;
};

export const createMiddleware = <
  F extends QuiverMiddleware<any, any> = QuiverMiddleware<unknown, unknown>,
>(
  f: F,
): F => {
  return f;
};

const createRoute = <
  I,
  O,
  CtxIn,
  CtxOut,
>(
  fn: QuiverFunction<I, CtxIn, O>,
  middleware: QuiverMiddleware<CtxIn, CtxOut>,
) => {
  return {
    middleware,
    fn,
  };
};

const squ = createRoute(
  (_, ctx) => ctx * ctx,
  (x: number) => x,
);

squ.fn(null, 10);

const createRouter = <
  CtxIn,
  CtxOut,
>(
  routes: {
    [key: string]: QuiverRouter<CtxOut, any> | QuiverRoute<CtxOut, any>;
  },
  middleware: QuiverMiddleware<CtxIn, CtxOut>,
) => {
  return {
    middleware,
    routes,
  };
};

// Why does createRouter inside createRouter break the type inference?

const r = createRoute(
  (x: { x: number }) => x,
  (i, ctx: { x: number }) => ctx.x,
);

const auth = createRouter(
  