/* 1 whenever A & B is satisfiable, 2 otherwise. We have to do this because of a
 * quirk (pronounced "wart") in TypeScript where A & B is not guaranteed to yield
 * never even when it is not satisfiable. */

export type SatisfiableCtx<A, B> = {
  [K in keyof A & keyof B]: A[K] extends B[K] ? 1 : B[K] extends A[K] ? 1 : 2;
}[keyof A & keyof B] extends 1
  ? 1
  : 2;
