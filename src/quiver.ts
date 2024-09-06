import { create } from "domain";

export type QuiverFunction<I, O> = (i: I) => O;

export type QuiverRouter<I> = {
  middleware?: QuiverFunction<I, any>;
  routes: {
    [key: string]: QuiverRouter<any> | QuiverRoute<any>;
  };
};

export type QuiverRoute<I> = {
  middleware?: QuiverFunction<I, any>;
  route: QuiverFunction<any, any>;
};

export const createFunction = <F extends QuiverFunction<any, any>>(f: F): F => {
  return f;
};

const createRoute = <
  R extends QuiverFunction<ReturnType<M>, any>,
  M extends QuiverFunction<any, any> = QuiverFunction<unknown, unknown>,
>(
  route: R,
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
  M extends QuiverFunction<any, any> = QuiverFunction<unknown, unknown>,
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
      (args: { a: number; b: number }) => {
        return args.a + args.b;
      },
      (m: string) => ({ a: m.length, b: 10 }),
    ),
  },
  (s: string) => s,
);

const d = createRouter({ math }, () => 10);

d.routes.math;
