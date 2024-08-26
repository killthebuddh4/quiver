import { QuiverFunction } from "./types/QuiverFunction.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverFunctionOptions } from "./types/QuiverFunctionOptions.js";

export const createFunction = <I = undefined, O = undefined>(
  // TODO, how can we have an args signature like (a, b, c, context)
  handler: (i: I, context: QuiverContext) => Promise<O>,
  options?: QuiverFunctionOptions<I, O>,
): QuiverFunction<I, O> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const any = (v: any): any => v;
  return {
    input: options?.input ?? any,
    output: options?.output ?? any,
    handler,
  };
};
