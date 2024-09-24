import { ParallelExtension } from "./util/ParallelExtension.js";
import { PipeableMw } from "./pipe/PipeableMw.js";
import { Resolve } from "./util/Resolve.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { ParallelExtendedCtxIn } from "./util/ParallelExtendedCtxIn.js";
import { ParallelExtendedCtxOut } from "./util/ParallelExtendedCtxOut.js";
import { PipedCtxIn } from "./pipe/PipedCtxIn.js";
import { PipedCtxOut } from "./pipe/PipedCtxOut.js";

export interface QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  type: "QUIVER_MIDDLEWARE";

  extend: <Exec>(
    exec: ParallelExtension<CtxIn, CtxOut, Exec>,
  ) => QuiverMiddleware<
    Resolve<ParallelExtendedCtxIn<CtxIn, Exec>>,
    Resolve<ParallelExtendedCtxOut<CtxOut, Exec>>,
    CtxExitIn,
    CtxExitOut
  >;

  pipe: <Next>(
    nxt: PipeableMw<CtxOut, Next>,
  ) => QuiverMiddleware<
    Resolve<
      PipedCtxIn<
        CtxIn,
        CtxOut,
        Next extends QuiverMiddleware<infer CtxInNext, any, any, any>
          ? CtxInNext
          : never
      >
    >,
    Resolve<
      PipedCtxOut<
        CtxOut,
        Next extends QuiverMiddleware<any, infer CtxOutNext, any, any>
          ? CtxOutNext
          : never
      >
    >,
    CtxExitIn,
    CtxExitOut
  >;

  router: () => QuiverRouter<CtxIn, CtxOut, Record<never, any>>;

  exec: (ctx: CtxIn) => CtxOut;

  function: <Exec extends (i: any, ctx: CtxOut) => any>(
    exec: Exec,
  ) => QuiverFunction<CtxIn, CtxOut, Exec>;
}
