type Left<X, Y> = { [K in keyof X & keyof Y]: X[K] };

type Right<X, Y> = { [K in keyof X & keyof Y]: Y[K] };

export type MiddlewareParallelInput<CtxInMw, CtxInFn> =
  Extract<keyof CtxInMw, keyof CtxInFn> extends never
    ? CtxInFn
    : Right<CtxInMw, CtxInFn> extends Left<CtxInMw, CtxInFn>
      ? CtxInFn
      : Left<CtxInMw, CtxInFn> extends Right<CtxInMw, CtxInFn>
        ? CtxInFn
        : never;
