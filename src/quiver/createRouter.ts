import { QuiverMiddleware } from "./createMiddleware.js";
import { QuiverRouter } from "../types/QuiverRouter.js";

export const createRouter = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  middleware: QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>,
) => {
  return <
    R extends {
      [key: string]:
        | QuiverRouter<CtxOut, CtxOut, unknown, unknown>
        | ((i: unknown, ctx: CtxOut) => unknown);
    },
  >(
    routes: R,
  ) => {
    return {
      middleware,
      routes,
    };
  };
};
