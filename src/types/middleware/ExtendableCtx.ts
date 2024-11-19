/* 1 whenever A & B is satisfiable, 2 otherwise. We have to do this because of a
 * quirk (pronounced "wart") in TypeScript where A & B is not guaranteed to yield
 * never even when it is not satisfiable. */

export type ExtendableCtx<LhsCtxIn, RhsCtxIn> = LhsCtxIn extends undefined
  ? 1
  : RhsCtxIn extends undefined
    ? 1
    : {
          [K in keyof LhsCtxIn &
            keyof RhsCtxIn]: LhsCtxIn[K] extends RhsCtxIn[K]
            ? 1
            : RhsCtxIn[K] extends LhsCtxIn[K]
              ? 1
              : 2;
        }[keyof LhsCtxIn & keyof RhsCtxIn] extends 1
      ? 1
      : 2;
