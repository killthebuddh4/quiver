import { PipeableMw } from "../types/middleware/PipeableMw.js";
import { Resolve } from "../types/util/Resolve.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { ExtendingMw } from "../types/middleware/ExtendingMw.js";
import { PipedCtxIn } from "../types/middleware/PipedCtxIn.js";
import { PipedCtxOut } from "../types/middleware/PipedCtxOut.js";
import { InCtx } from "../types/middleware/InCtx.js";
import { OutCtx } from "../types/middleware/OutCtx.js";
import { ExtendedCtxIn } from "../types/middleware/ExtendedCtxIn.js";

export const createMiddleware = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  handler: (ctx: any) => any,
): QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> => {
  const type = "QUIVER_MIDDLEWARE" as const;

  const extend = <Next>(
    next: ExtendingMw<QuiverMiddleware<CtxIn, CtxOut, any, any>, Next>,
  ) => {
    const nxt = (ctx: any) => {
      return {
        ...next.exec({ ...ctx }),
        ...handler({ ...ctx }),
      };
    };

    return createMiddleware<
      Resolve<ExtendedCtxIn<CtxIn, InCtx<Next>>>,
      Resolve<CtxOut & OutCtx<Next>>,
      CtxExitIn,
      CtxExitOut
    >(nxt);
  };

  const pipe = <Next>(
    next: PipeableMw<QuiverMiddleware<CtxIn, CtxOut, any, any>, Next>,
  ) => {
    const nxt = (ctx: any) => {
      const ctxnext = {
        ...ctx,
        ...handler({ ...ctx }),
      };

      return {
        ...next.exec({ ...ctxnext }),
      };
    };

    return createMiddleware<
      Resolve<PipedCtxIn<CtxIn, CtxOut, InCtx<Next>>>,
      Resolve<PipedCtxOut<CtxOut, OutCtx<Next>>>,
      CtxExitIn,
      CtxExitOut
    >(nxt);
  };

  const exec = (ctx: any) => {
    return { ...ctx, ...handler(ctx) };
  };

  return { type, extend, pipe, exec };
};
