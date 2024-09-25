export type ExtendedCtxOut<CtxOut, CtxInNext, CtxOutNext> =
  CtxInNext extends undefined
    ? CtxOutNext & CtxOut
    : CtxInNext & CtxOutNext & CtxOut;
