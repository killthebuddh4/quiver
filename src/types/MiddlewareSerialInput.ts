type Left<X, Y> = { [K in keyof X & keyof Y]: X[K] };

type Right<X, Y> = { [K in keyof X & keyof Y]: Y[K] };

export type MiddlewareSerialInput<CtxOutMw, CtxInFn> =
  Extract<keyof CtxOutMw, keyof CtxInFn> extends never
    ? CtxInFn
    : Right<CtxOutMw, CtxInFn> extends Left<CtxOutMw, CtxInFn>
      ? CtxInFn
      : never;
