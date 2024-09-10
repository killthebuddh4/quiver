import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverMiddleware } from "../quiver/createMiddleware.js";

export type QuiverRouter<CtxIn, CtxOut, CtxExitIn, CtxExitOut> = {
  middleware?: QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>;
  routes: {
    [key: string]:
      | QuiverFunction<CtxOut, any, any, CtxExitIn>
      | QuiverRouter<CtxOut, any, any, CtxExitIn>;
  };
};
