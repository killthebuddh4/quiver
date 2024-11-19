export type ComposedCtx<Lhs, Rhs> = Lhs extends undefined
  ? Rhs
  : Rhs extends undefined
    ? Lhs
    : Lhs & Rhs;
