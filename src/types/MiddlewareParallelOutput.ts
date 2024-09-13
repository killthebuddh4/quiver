export type MiddlewareParallelOutput<CtxOutMw, CtxOutFn> =
  Extract<keyof CtxOutMw, keyof CtxOutFn> extends never ? CtxOutFn : never;
