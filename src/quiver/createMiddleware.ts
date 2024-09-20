import { ParallelExtension } from "../types/util/ParallelExtension.js";
import { SerialExtension } from "../types/util/SerialExtension.js";
import { Resolve } from "../types/util/Resolve.js";
import { createFunction } from "./createFunction.js";
import { createRouter } from "./createRouter.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { ParallelExtendedCtxIn } from "../types/util/ParallelExtendedCtxIn.js";
import { ParallelExtendedCtxOut } from "../types/util/ParallelExtendedCtxOut.js";
import { SerialExtendedCtxIn } from "../types/util/SerialExtendedCtxIn.js";
import { SerialExtendedCtxOut } from "../types/util/SerialExtendedCtxOut.js";

export const createMiddleware = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  handlers: Array<Array<(ctx: any) => any>>,
): QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> => {
  const type = "QUIVER_MIDDLEWARE" as const;

  const extend = <Exec>(fn: ParallelExtension<CtxIn, CtxOut, Exec>) => {
    if (handlers.length === 0) {
      throw new Error("Middleware instance should never have empty handlers");
    }

    const next = handlers.map((stage) => stage.map((handler) => handler));

    next[next.length - 1].push(fn);

    return createMiddleware<
      Resolve<ParallelExtendedCtxIn<CtxIn, Exec>>,
      Resolve<ParallelExtendedCtxOut<CtxOut, Exec>>,
      CtxExitIn,
      CtxExitOut
    >(next);
  };

  const pipe = <Exec>(fn: SerialExtension<CtxOut, Exec>) => {
    if (handlers.length === 0) {
      throw new Error("Middleware instance should never have empty handlers");
    }

    const next = handlers.map((stage) => stage.map((handler) => handler));

    next.push([fn]);

    return createMiddleware<
      Resolve<SerialExtendedCtxIn<CtxIn, CtxOut, Exec>>,
      Resolve<SerialExtendedCtxOut<CtxOut, Exec>>,
      CtxExitIn,
      CtxExitOut
    >(next);
  };

  const _switch = <Branches extends { [key: string]: (ctx: CtxOut) => any }>(
    branches: Branches,
  ) => {
    const mw = {} as { [key in keyof Branches]: any };

    for (const key in branches) {
      mw[key] = createMiddleware([[branches[key]]]);
    }

    return createRouter<CtxIn, CtxOut, { [key in keyof Branches]: any }>(
      createMiddleware(handlers),
      branches,
    );
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

  const _function = <Exec extends (i: any, ctx: CtxOut) => any>(
    exec: Exec,
  ): QuiverFunction<CtxIn, CtxOut, Exec> => {
    return createFunction(createMiddleware(handlers), exec);
  };

  return { type, extend, pipe, exec, function: _function, router: _switch };
};
