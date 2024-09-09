export const createFunction =
  <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
    use?: (ctx: CtxIn) => CtxOut,
    exit?: (ctx: CtxExitIn) => CtxExitOut,
  ) =>
  <I, O>(
    fn: (i: I, ctx: CtxOut) => O,
  ): {
    use: (ctx: CtxIn) => CtxOut;
    exit: (ctx: CtxExitIn) => CtxExitOut;
    fn: (i: I, ctx: CtxOut) => O;
  } => {
    return {
      use: use || ((x: any) => x),
      exit: exit || ((x: any) => x),
      fn,
    };
  };
