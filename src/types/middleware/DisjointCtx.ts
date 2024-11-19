/* 1 whenever A & B is satisfiable, 2 otherwise. We have to do this because of a
 * quirk (pronounced "wart") in TypeScript where A & B is not guaranteed to yield
 * never even when it is not satisfiable. */

export type DisjointCtx<LhsCtxIn, RhsCtxIn> = LhsCtxIn extends undefined
  ? 1
  : RhsCtxIn extends undefined
    ? 1
    : Extract<keyof LhsCtxIn, keyof RhsCtxIn> extends never
      ? 1
      : 2;
