import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverApp } from "../types/QuiverApp.js";

export const createApp = <
  CtxIn,
  CtxOut,
  R extends {
    [key: string]: QuiverFunction<CtxOut> | QuiverApp<CtxOut, any>;
  },
>(
  middleware: (ctx: CtxIn) => CtxOut,
  routes: {
    [key in keyof R]: R[key];
  },
) => {
  return {
    middleware,
    routes,
  };
};
