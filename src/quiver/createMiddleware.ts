import { PipeableMw } from "../types/pipe/PipeableMw.js";
import { Resolve } from "../types/util/Resolve.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { ExtendedCtxIn } from "../types/extend/ExtendedCtxIn.js";
import { ExtendedCtxOut } from "../types/extend/ExtendedCtxOut.js";
import { ExtendingMw } from "../types/extend/ExtendingMw.js";
import { PipedCtxIn } from "../types/pipe/PipedCtxIn.js";
import { PipedCtxOut } from "../types/pipe/PipedCtxOut.js";

export const createMiddleware = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  handlers: Array<Array<(ctx: any) => any>>,
): QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> => {
  const type = "QUIVER_MIDDLEWARE" as const;

  const extend = <Next>(next: ExtendingMw<CtxIn, CtxOut, Next>) => {
    if (handlers.length === 0) {
      throw new Error("Middleware instance should never have empty handlers");
    }

    const nxt = handlers.map((stage) => stage.map((handler) => handler));

    nxt[nxt.length - 1].push(next.exec);

    return createMiddleware<
      Resolve<ExtendedCtxIn<CtxIn, NextCtxIn<Next>>>,
      Resolve<ExtendedCtxOut<CtxOut, NextCtxIn<Next>, NextCtxOut<Next>>>,
      CtxExitIn,
      CtxExitOut
    >(nxt);
  };

  const pipe = <Exec>(fn: PipeableMw<CtxOut, Exec>) => {
    if (handlers.length === 0) {
      throw new Error("Middleware instance should never have empty handlers");
    }

    const next = handlers.map((stage) => stage.map((handler) => handler));

    next.push([fn.exec]);

    return createMiddleware<
      Resolve<
        PipedCtxIn<
          CtxIn,
          CtxOut,
          Exec extends QuiverMiddleware<infer CtxInNext, any, any, any>
            ? CtxInNext
            : never
        >
      >,
      Resolve<
        PipedCtxOut<
          CtxOut,
          Exec extends QuiverMiddleware<any, infer CtxOutNext, any, any>
            ? CtxOutNext
            : never
        >
      >,
      CtxExitIn,
      CtxExitOut
    >(next);
  };

  const exec = (ctx: CtxIn): CtxOut => {
    let final: any = ctx;

    for (const stage of handlers) {
      let intermediate: any = final;

      for (const handler of stage) {
        intermediate = {
          ...intermediate,
          ...handler(final),
        };
      }

      final = intermediate;
    }

    return final;
  };

  return { type, extend, pipe, exec };
};

type NextCtxIn<Next> =
  Next extends QuiverMiddleware<infer CtxIn, any, any, any> ? CtxIn : never;

type NextCtxOut<Next> =
  Next extends QuiverMiddleware<any, infer CtxOut, any, any> ? CtxOut : never;
