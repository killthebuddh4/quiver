export type QuiverFunction<CtxIn, CtxExitOut> = {
  use: (ctx: CtxIn) => any;
  exit: (ctx: any) => CtxExitOut;
  fn: (i: any, ctx: any) => any;
};
