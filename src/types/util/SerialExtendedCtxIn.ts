export type SerialExtendedCtxIn<CtxIn, CtxOut, Exec> = Exec extends (
  ctx: infer I,
) => any
  ? CtxIn extends undefined
    ? Omit<I, keyof CtxOut>
    : Omit<I, keyof CtxIn> & CtxIn
  : never;
