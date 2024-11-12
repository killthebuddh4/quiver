import { PipeableMw } from "./pipe/PipeableMw.js";
import { Resolve } from "./util/Resolve.js";
import { ExtendedCtxIn } from "./extend/ExtendedCtxIn.js";
import { ExtendedCtxOut } from "./extend/ExtendedCtxOut.js";
import { ExtendingMw } from "./extend/ExtendingMw.js";
import { PipedCtxIn } from "./pipe/PipedCtxIn.js";
import { PipedCtxOut } from "./pipe/PipedCtxOut.js";

type NextCtxIn<Next> =
  Next extends QuiverMiddleware<infer CtxIn, any, any, any> ? CtxIn : never;

type NextCtxOut<Next> =
  Next extends QuiverMiddleware<any, infer CtxOut, any, any> ? CtxOut : never;

export interface QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  type: "QUIVER_MIDDLEWARE";

  extend: <Next>(
    next: ExtendingMw<CtxIn, CtxOut, Next>,
  ) => QuiverMiddleware<
    Resolve<ExtendedCtxIn<CtxIn, NextCtxIn<Next>>>,
    Resolve<ExtendedCtxOut<CtxOut, NextCtxIn<Next>, NextCtxOut<Next>>>,
    CtxExitIn,
    CtxExitOut
  >;

  pipe: <Next>(
    nxt: PipeableMw<CtxOut, Next>,
  ) => QuiverMiddleware<
    Resolve<PipedCtxIn<CtxIn, CtxOut, NextCtxIn<Next>>>,
    Resolve<PipedCtxOut<CtxOut, NextCtxOut<Next>>>,
    CtxExitIn,
    CtxExitOut
  >;

  exec: (ctx: CtxIn) => CtxOut;
}
