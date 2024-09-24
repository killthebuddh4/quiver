export type ParallelExtendedCtxIn<CtxIn, Exec> = Exec extends (
  ctx: any,
) => any
  ? CtxIn extends undefined
    ? Parameters<Exec>[0]
    : Parameters<Exec>[0] extends undefined ? CtxIn : Parameters<Exec>[0] & CtxIn
  : never;
