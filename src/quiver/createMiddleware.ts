import { PipeableMw } from "../types/middleware/PipeableMw.js";
import { Resolve } from "../types/util/Resolve.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { ExtendingMw } from "../types/middleware/ExtendingMw.js";
import { PipedCtxIn } from "../types/middleware/PipedCtxIn.js";
import { PipedCtxOut } from "../types/middleware/PipedCtxOut.js";

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
      Resolve<CtxIn & NextCtxIn<Next>>,
      Resolve<CtxOut & NextCtxOut<Next>>,
      CtxExitIn,
      CtxExitOut
    >(nxt);
  };

  const pipe = <Next>(
    next: PipeableMw<QuiverMiddleware<CtxIn, CtxOut, any, any>, Next>,
  ) => {
    const nxt = (ctx: any) => {
      let ctxnext = {
        ...ctx,
        ...handler({ ...ctx }),
      };

      return {
        ...next.exec({ ...ctxnext }),
      };
    };

    return createMiddleware<
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
    >(nxt);
  };

  const exec = (ctx: any) => {
    return { ...ctx, ...handler(ctx) };
  };

  return { type, extend, pipe, exec };
};

type NextCtxIn<Next> =
  Next extends QuiverMiddleware<infer CtxIn, any, any, any> ? CtxIn : never;

type NextCtxOut<Next> =
  Next extends QuiverMiddleware<any, infer CtxOut, any, any> ? CtxOut : never;
