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
  const extend = <F>(fn: ParallelExtension<CtxIn, CtxOut, F>) => {
    if (handlers.length === 0) {
      throw new Error("Middleware instance should never have empty handlers");
    }

    const next = handlers.map((stage) => stage.map((handler) => handler));

    next[next.length - 1].push(fn);

    return createMiddleware<
      Resolve<F extends (ctx: infer I) => any ? I & CtxIn : never>,
      Resolve<F extends (ctx: any) => infer O ? O & CtxOut : never>,
      CtxExitIn,
      CtxExitOut
    >(next);
  };

  const pipe = <F>(fn: SerialExtension<CtxOut, F>) => {
    if (handlers.length === 0) {
      throw new Error("Middleware instance should never have empty handlers");
    }

    const next = handlers.map((stage) => stage.map((handler) => handler));

    next.push([fn]);

    return createMiddleware<
      Resolve<
        F extends (ctx: infer I) => any ? Omit<I, keyof CtxIn> & CtxIn : never
      >,
      Resolve<F extends (ctx: any) => infer O ? O & CtxOut : never>,
      CtxExitIn,
      CtxExitOut
    >(next);
  };

  const compile = () => {
    return handlers;
  };

  const exec = (ctx: CtxIn) => {
    let final: any = ctx;

    for (const stage of handlers) {
      let intermediate: any = final;

      for (const handler of stage) {
        intermediate = handler(final);
      }

      final = intermediate;
    }

    return final;
  };

  const _function = <Exec extends (...args: any[]) => any>(
    fn: Exec,
  ): QuiverFunction<CtxIn, CtxOut, Exec> => {
    return createFunction(createMiddleware(handlers), fn);
  };

  const router = <
    Routes extends {
      [key: string]:
        | QuiverFunction<CtxOut, any, any>
        | QuiverRouter<CtxOut, any, any>;
    },
  >(
    routes: Routes,
  ): QuiverRouter<CtxIn, CtxOut, Routes> => {
    return createRouter(createMiddleware(handlers), routes);
  };

  return { extend, pipe, compile, exec, function: _function, router };
};
