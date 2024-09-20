import { ParallelExtension } from "./util/ParallelExtension.js";
import { SerialExtension } from "./util/SerialExtension.js";
import { Resolve } from "./util/Resolve.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { ParallelExtendedCtxIn } from "./util/ParallelExtendedCtxIn.js";
import { ParallelExtendedCtxOut } from "./util/ParallelExtendedCtxOut.js";
import { SerialExtendedCtxIn } from "./util/SerialExtendedCtxIn.js";
import { SerialExtendedCtxOut } from "./util/SerialExtendedCtxOut.js";

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

  pipe: <Exec>(
    exec: SerialExtension<CtxOut, Exec>,
  ) => QuiverMiddleware<
    Resolve<SerialExtendedCtxIn<CtxIn, CtxOut, Exec>>,
    Resolve<SerialExtendedCtxOut<CtxOut, Exec>>,
    CtxExitIn,
    CtxExitOut
  >;

  router: <
    Routes extends {
      [key: string]: (ctx: CtxOut) => any;
    },
  >(
    routes: Routes,
  ) => QuiverRouter<CtxIn, CtxOut, { [key in keyof Routes]: any }>;

  exec: (ctx: CtxIn) => CtxOut;

  function: <Exec extends (i: any, ctx: CtxOut) => any>(
    exec: Exec,
  ) => QuiverFunction<CtxIn, CtxOut, Exec>;
}
