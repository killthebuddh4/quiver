export type PipedCtxIn<CtxIn, CtxOut, CtxInNext> = CtxIn extends undefined
  ? CtxInNext extends undefined
    ? // both undefined
      undefined
    : // only CtxIn is undefined
      Extract<keyof CtxOut, keyof CtxInNext> extends never
      ? CtxInNext
      : keyof Omit<CtxInNext, keyof CtxOut> extends never
        ? undefined
        : Omit<CtxInNext, keyof CtxOut>
  : CtxInNext extends undefined
    ? // only CtxInNext is undefined
      CtxIn
    : // neither is undefined
      Omit<CtxInNext, keyof CtxOut> & CtxIn;
