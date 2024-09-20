export type ParallelExtendedCtxOut<CtxOut, Exec> = Exec extends (
  ctx: infer I,
) => infer O
  ? I & O & CtxOut
  : never;
