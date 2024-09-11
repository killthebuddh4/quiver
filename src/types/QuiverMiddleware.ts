export type QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> = {
  use: (ctx: CtxIn) => CtxOut;
  exit: (ctx: CtxExitIn) => CtxExitOut;
};
