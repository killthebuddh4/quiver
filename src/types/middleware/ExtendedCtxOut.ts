import { ComposedCtx } from "./ComposedCtx.js";

export type ExtendedCtxOut<LhsCtxOut, RhsCtxOut> = ComposedCtx<
  LhsCtxOut,
  RhsCtxOut
>;
