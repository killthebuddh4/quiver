import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverMiddleware } from "./createMiddleware.js";

export const createRouter = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  middleware?: QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>,
) => {
  return <R extends QuiverRouter<CtxIn, CtxOut, CtxExitIn, CtxExitOut>>(
    routes: R["routes"],
  ) => {
    return {
      middleware,
      routes,
    };
  };
};
