/* For each key that's in both Lhs and Rhs, the Lhs type must be more specific
 * than the Rhs type. Note that "lhs can be piped to rhs" does not mean Lhs
 * satisfies rhs, it just means that lhs does not contradict rhs. */

export type PipeableCtx<ResultCtx, RhsCtxIn> = RhsCtxIn extends undefined
  ? 1
  : ResultCtx extends undefined
    ? 2
    : {
          [K in keyof ResultCtx &
            keyof RhsCtxIn]: ResultCtx[K] extends RhsCtxIn[K] ? 1 : 2;
        }[keyof ResultCtx & keyof RhsCtxIn] extends 1
      ? 1
      : 2;
