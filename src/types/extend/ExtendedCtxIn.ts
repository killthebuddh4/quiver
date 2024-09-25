export type ExtendedCtxIn<CtxIn, CtxInNext> = CtxIn extends undefined
  ? CtxInNext
  : CtxInNext extends undefined
    ? CtxIn
    : CtxInNext & CtxIn;
