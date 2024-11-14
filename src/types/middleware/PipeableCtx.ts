/* For each key that's in both Lhs and Rhs, the Lhs type must be more specific
 * than the Rhs type. Note that "lhs can be piped to rhs" does not mean Lhs
 * satisfies rhs, it just means that lhs does not contradict rhs. */

export type PipeableCtx<Lhs, Rhs> = {
  [K in keyof Lhs & keyof Rhs]: Lhs[K] extends Rhs[K] ? 1 : 2;
}[keyof Lhs & keyof Rhs] extends 1
  ? 1
  : 2;
