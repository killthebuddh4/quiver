export type QuiverFunction<CtxIn> = {
  middleware: (ctx: CtxIn) => any;
  fn: (i: any, ctx: any) => any;
};
