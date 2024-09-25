export type ExtendingCtxOut<CtxOutMw, CtxOutNext> =
  Extract<keyof CtxOutMw, keyof CtxOutNext> extends never ? CtxOutNext : never;
