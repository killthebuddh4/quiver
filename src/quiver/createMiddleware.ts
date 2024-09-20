import { ParallelExtension } from "../types/util/ParallelExtension.js";
import { SerialExtension } from "../types/util/SerialExtension.js";
import { Resolve } from "../types/util/Resolve.js";
import { createFunction } from "./createFunction.js";
import { createRouter } from "./createRouter.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverFunction } from "../types/QuiverFunction.js";

export const createMiddleware = <CtxIn, CtxOut, CtxExitIn, CtxExitOut>(
  handlers: Array<Array<(ctx: any) => any>>,
): QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> => {
  const extend = <Exec>(fn: ParallelExtension<CtxIn, CtxOut, Exec>) => {
    if (handlers.length === 0) {
      throw new Error("Middleware instance should never have empty handlers");
    }

    const next = handlers.map((stage) => stage.map((handler) => handler));

    next[next.length - 1].push(fn);

    return createMiddleware<
      Resolve<
        Exec extends (ctx: infer I) => any
          ? CtxIn extends undefined
            ? I
            : I & CtxIn
          : never
      >,
      Resolve<Exec extends (ctx: infer I) => infer O ? I & O & CtxOut : never>,
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
      Resolve<
        Exec extends (ctx: infer I) => any
          ? CtxIn extends undefined
            ? Omit<I, keyof CtxOut>
            : Omit<I, keyof CtxIn> & CtxIn
          : never
      >,
      Resolve<Exec extends (ctx: any) => infer O ? O & CtxOut : never>,
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

  const _function = <Exec extends (i: any, ctx: CtxOut) => any>(
    exec: Exec,
  ): QuiverFunction<CtxIn, CtxOut, Exec> => {
    return createFunction(createMiddleware(handlers), exec);
  };

  const router = <
    Routes extends {
      [key: string]:
        | QuiverFunction<CtxOut | undefined, any, any>
        | QuiverRouter<CtxOut | undefined, any, any>;
    },
  >(
    routes: Routes,
  ): QuiverRouter<CtxIn, CtxOut, Routes> => {
    return createRouter(createMiddleware(handlers), routes);
  };

  return { extend, pipe, exec, function: _function, router };
};
