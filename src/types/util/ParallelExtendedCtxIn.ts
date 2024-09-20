export type ParallelExtendedCtxIn<CtxIn, Exec> = Exec extends (
  ctx: infer I,
) => any
  ? CtxIn extends undefined
    ? I
    : I & CtxIn
  : never;
