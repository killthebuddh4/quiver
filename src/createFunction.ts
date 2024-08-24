import { z } from "zod";
import { QuiverFunction } from "./types/QuiverFunction.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverFunctionOptions } from "./types/QuiverFunctionOptions.js";

export const createFunction = <I = undefined, O = undefined>(
  // TODO, how can we have an args signature like (a, b, c, context)
  handler: (i: I, context: QuiverContext) => Promise<O>,
  options?: QuiverFunctionOptions<I, O>,
): QuiverFunction<I, O> => {
  return {
    input: options?.input ?? z.any(),
    output: options?.output ?? z.any(),
    handler,
  };
};
