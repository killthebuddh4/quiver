/* Constructs the complement of C in U. */

export type RemainderCtx<U, S> = U extends undefined
  ? S
  : S extends undefined
    ? U
    : Exclude<keyof U, keyof S> extends never
      ? undefined
      : {
          [K in Exclude<keyof U, keyof S>]: U[K];
        };
