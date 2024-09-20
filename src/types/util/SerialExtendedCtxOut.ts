export type SerialExtendedCtxOut<CtxOut, Exec> = Exec extends (
  ctx: any,
) => infer O
  ? O & CtxOut
  : never;
