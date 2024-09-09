export const createMiddleware = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  use?: (ctx: CtxIn) => CtxOut,
  exit?: (ctx: CtxExitIn) => CtxExitOut,
) => {
  return {
    use: use || ((x: any) => x),
    exit: exit || ((x: any) => x),
  };
};
