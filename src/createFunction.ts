import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { QuiverFunction } from "./types/QuiverFunction.js";
import { QuiverFunctionOptions } from "./types/QuiverFunctionOptions.js";
import { parseAny } from "./lib/parseAny.js";
import { createMiddleware } from "./createMiddleware.js";

export const createFunction = <I, CtxI, CtxO, O>(
  handler: (i: I, context: CtxO) => Promise<O>,
  middleware?: QuiverMiddleware<CtxI, CtxO>,
  options?: QuiverFunctionOptions,
): QuiverFunction<I, CtxI, CtxO, O> => {
  return {
    middleware: middleware ?? createMiddleware((x) => x),
    input: options?.input ?? parseAny,
    output: options?.output ?? parseAny,
    handler,
    options,
  };
};
