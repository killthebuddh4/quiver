/* eslint-disable @typescript-eslint/no-explicit-any */

// if you have routes, then your "use" function can only maintain the same type.
// if you don't have routes, then your "use" function can change the type.
// if you have handlers, then your "route" function can only maintain the same type.
// if you don't have handlers, then your "route" function can change the type.

// if you have handlers, then your use and route functions can only maintain the same type.
// if you have routes, then your use function can only maintain the same type.
// otherwise, your use function

type Middleware<I, O> = (input: I) => O;

type Router<I, M, R> = {
  root: Middleware<I, M>;
  routes: {
    [K in keyof R]: Middleware<M, R[K]>;
  };
};

const createRouter = <I, M, R extends Record<string, any>>(
  root: Middleware<I, M>,
  routes: {
    [K in keyof R]: Middleware<M, R[K]>;
  },
): Router<I, M, R> => {
  return {
    root,
    routes,
  };
};

const addRoute = <
  I,
  M,
  R extends Record<string, any>,
  K extends Exclude<string, keyof R>,
  V,
>(
  path: K,
  mw: Middleware<M, V>,
  router: Router<I, M, R>,
): Router<I, M, R & Record<K, V>> => {
  return {
    root: router.root,
    routes: {
      ...router.routes,
      [path]: mw,
    },
  };
};

const wrapRoute = <I, M, R extends Record<string, any>, K extends keyof R, V>(
  path: K,
  mw: Middleware<R[K], V>,
  router: Router<I, M, R>,
): Router<I, M, Omit<R, K> & Record<K, V>> => {
  const existingMiddleware = router.routes[path] as Middleware<M, R[K]>;

  const extendedMiddleware: Middleware<M, V> = (input: M) => {
    const intermediateResult = existingMiddleware(input);
    return mw(intermediateResult);
  };

  return {
    root: router.root,
    routes: {
      ...router.routes,
      [path]: extendedMiddleware,
    },
  };
};

const router = createRouter((input: string) => input.length, {
  a: (input: number) => input + 1,
  b: (input: number) => input > 10,
});

const extended = addRoute("c", (input: number) => String(input), router);

extended.routes.c(1);

function useRoutes<I, M, R>(
  router: Router<I, M, R>,
  handlers: { [K in keyof R]: (output: R[K]) => void },
): typeof handlers {
  return handlers;
}

const handlers = {
  a: (output: number) => console.log(output),
  b: (output: number) => console.log(output),
  c: (output: string) => console.log(output),
};

const usedHandlers = useRoutes(router, handlers);
