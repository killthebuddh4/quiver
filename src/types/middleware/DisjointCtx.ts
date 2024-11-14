/* 1 whenever A & B is satisfiable, 2 otherwise. We have to do this because of a
 * quirk (pronounced "wart") in TypeScript where A & B is not guaranteed to yield
 * never even when it is not satisfiable. */

export type DisjointCtx<A, B> = Extract<keyof A, keyof B> extends never ? 1 : 2;
