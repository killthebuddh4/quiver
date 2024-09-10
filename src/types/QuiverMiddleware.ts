export type QuiverMiddleware<CtxIn, CtxExitOut> = {
  use: (ctx: CtxIn) => any;
  exit: (ctx: any) => CtxExitOut;
};
