type QuiverDecorator<CtxIn, CtxOut, CtxExitIn, CtxExitOut> = {
  use: <I extends CtxOut, O>(
    fn: (i: I) => O,
  ) => QuiverDecorator<CtxIn, O, CtxExitIn, CtxExitOut>;
  exit: <I extends CtxExitOut, O>(
    fn: (i: I) => O,
  ) => QuiverDecorator<CtxIn, CtxOut, CtxExitIn, O>;
};

const decoratorWithoutAny = (): QuiverDecorator<
  unknown,
  unknown,
  unknown,
  unknown
> => {
  const use = <CtxIn, CtxOut>(fn: (ctx: CtxIn) => CtxOut) => {
    return decoratorWithoutExit<CtxIn, CtxOut>([fn]);
  };

  const exit = <CtxExitIn, CtxExitOut>(fn: (ctx: CtxExitIn) => CtxExitOut) => {
    return decoratorWithoutUse([fn]);
  };

  return { use, exit };
};

const decoratorWithoutExit = <CtxIn, CtxOut>(
  fns: Array<(ctx: any) => any>,
): QuiverDecorator<CtxIn, CtxOut, any, any> => {
  const use = <I extends CtxOut, O>(fn: (i: I) => O) => {
    return decoratorWithoutExit<CtxIn, O>([...fns, fn]);
  };

  const exit = <CtxExitIn, CtxExitOut>(fn: (ctx: CtxExitIn) => CtxExitOut) => {
    return decoratorWithAll<CtxIn, CtxOut, CtxExitIn, CtxExitOut>(fns, [fn]);
  };

  return { use, exit };
};

const decoratorWithoutUse = <CtxExitIn, CtxExitOut>(
  fns: Array<(ctx: any) => any>,
): QuiverDecorator<any, any, CtxExitIn, CtxExitOut> => {
  const use = <CtxIn, CtxOut>(fn: (ctx: CtxIn) => CtxOut) => {
    return decoratorWithAll<CtxIn, CtxOut, CtxExitIn, CtxExitOut>([fn], fns);
  };

  const exit = <I extends CtxExitOut, O>(fn: (i: I) => O) => {
    return decoratorWithoutUse<CtxExitIn, O>([...fns, fn]);
  };

  return { use, exit };
};

const decoratorWithAll = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  use: Array<(ctx: any) => any>,
  exit: Array<(ctx: any) => any>,
): QuiverDecorator<CtxIn, CtxOut, CtxExitIn, CtxExitOut> => {
  const u = <I extends CtxOut, O>(fn: (i: I) => O) => {
    return decoratorWithAll<CtxIn, O, CtxExitIn, CtxExitOut>(
      [...use, fn],
      exit,
    );
  };

  const x = <I extends CtxExitOut, O>(fn: (i: I) => O) => {
    return decoratorWithAll<CtxIn, CtxOut, CtxExitIn, O>(use, [...exit, fn]);
  };

  return { use: u, exit: x };
};

export const createDecorator = () => decoratorWithoutAny();
