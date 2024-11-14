/* Constructs the complement of C in U. */

export type ComplementCtx<U, C> = {
  [K in Exclude<keyof U, keyof C>]: U[K];
};
