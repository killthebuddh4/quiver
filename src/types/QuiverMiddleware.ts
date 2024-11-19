import { PipeableMw } from "./middleware/PipeableMw.js";
import { Resolve } from "./util/Resolve.js";
import { ExtendingMw } from "./middleware/ExtendingMw.js";
import { PipedCtxIn } from "./middleware/PipedCtxIn.js";
import { PipedCtxOut } from "./middleware/PipedCtxOut.js";
import { QuiverPipeline } from "./QuiverPipeline.js";
import { ExtendedCtxIn } from "./middleware/ExtendedCtxIn.js";

type NextCtxIn<Next> =
  Next extends QuiverMiddleware<infer CtxIn, any, any, any> ? CtxIn : never;

type NextCtxOut<Next> =
  Next extends QuiverMiddleware<any, infer CtxOut, any, any> ? CtxOut : never;

export interface QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  type: "QUIVER_MIDDLEWARE";

  extend: <Next>(
    next: ExtendingMw<QuiverMiddleware<CtxIn, CtxOut, any, any>, Next>,
  ) => QuiverMiddleware<
    Resolve<ExtendedCtxIn<CtxIn, NextCtxIn<Next>>>,
    Resolve<CtxOut & NextCtxOut<Next>>,
    CtxExitIn,
    CtxExitOut
  >;

  pipe: <Next>(
    nxt: PipeableMw<QuiverMiddleware<CtxIn, CtxOut, any, any>, Next>,
  ) => QuiverMiddleware<
    Resolve<PipedCtxIn<CtxIn, CtxOut, NextCtxIn<Next>>>,
    Resolve<PipedCtxOut<CtxOut, NextCtxOut<Next>>>,
    CtxExitIn,
    CtxExitOut
  >;

  exec: (ctx: any) => any;
}
