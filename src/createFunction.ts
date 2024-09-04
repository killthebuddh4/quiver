import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { QuiverFunction } from "./types/QuiverFunction.js";
import { QuiverFunctionOptions } from "./types/QuiverFunctionOptions.js";
import { parseAny } from "./lib/parseAny.js";
import { createMiddleware } from "./quiver/QuiverMiddleware.js";

export const createFunction = <I, O, CtxI = I, CtxO = I>(
  handler: (i: I, context: CtxI) => Promise<O>,
  middleware?: QuiverMiddleware<CtxI, CtxO>,
  options?: QuiverFunctionOptions,
): QuiverFunction<I, CtxI, CtxO, O> => {
  const handler = 
  return {
    middleware: middleware ?? createMiddleware((x) => x),
    input: options?.input ?? parseAny,
    output: options?.output ?? parseAny,
    handler,
    options,
  };
};
