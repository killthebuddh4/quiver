export type QuiverFunction<I, O> = (i: I) => O;

export const createFunction = <I, O>(f: (i: I) => O): QuiverFunction<I, O> => {
  return f;
};

export type QuiverRouter = {
  [key: string]: QuiverRoute;
};

export const createRouter = <O extends QuiverRouter>(r: O) => {
  return r;
};

export type QuiverRoute = QuiverRouter | QuiverFunction<any, any>;

export const createRoute = <O extends QuiverRoute>(n: O) => {
  return n;
};

export const router = createRoute({
  math: createRouter({
    add: createFunction((args: { a: number; b: number }) => args.a + args.b),
    sub: createFunction((args: { a: number; b: number }) => args.a - args.b),
    mul: createFunction((args: { a: number; b: number }) => args.a * args.b),
    div: createFunction((args: { a: number; b: number }) => args.a / args.b),
  }),
  string: createRouter({
    concat: createFunction((args: { a: string; b: string }) => args.a + args.b),
  }),
  log: createFunction((args: any) => console.log(args)),
});

export const auth = createRoute(() => {
  return false;
});

export const app = createRouter({
  public: router,
  auth,
});

export const addRoute = <
  Router extends QuiverRouter,
  Path extends string,
  Route extends QuiverRoute,
>(
  to: Router,
  path: Path,
  route: Route,
): Router & { [key in Path]: Route } => {
  return { ...to, [path]: route } as any;
};

const withHello = addRoute(
  app,
  "hello",
  createFunction((name: string) => `Hello, ${name}!`),
);

withHello.hello("world");
