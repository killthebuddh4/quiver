import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverRouter } from "../types/QuiverRouter.js";

export const createRouter =
  <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
    use?: (ctx: CtxIn) => CtxOut,
    exit?: (ctx: CtxExitIn) => CtxExitOut,
  ) =>
  <
    R extends {
      [key: string]: QuiverFunction<CtxOut, any> | QuiverRouter<CtxOut, any>;
    },
  >(routes: {
    [key in keyof R]: R[key];
  }): {
    use: (ctx: CtxIn) => CtxOut;
    exit: (ctx: CtxExitIn) => CtxExitOut;
    routes: {
      [key in keyof R]: R[key];
    };
  } => {
    return {
      use: use || ((x: unknown) => x),
      exit: exit || ((x: unknown) => x),
      routes,
    };
  };
