export const createFunction = <CtxIn, CtxOut, I, O>(
  middleware: (ctx: CtxIn) => CtxOut,
  fn: (i: I, ctx: CtxOut) => O,
) => {
  return {
    middleware,
    fn,
  };
};
