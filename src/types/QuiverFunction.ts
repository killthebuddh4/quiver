import { ZodType } from "zod";
import { QuiverContext } from "./QuiverContext.js";
import { QuiverFunctionOptions } from "./QuiverFunctionOptions.js";

export type QuiverFunction<I, O> = {
  input: ZodType<I>;
  output: ZodType<O>;
  handler: (i: I, context: QuiverContext) => Promise<O>;
  options?: QuiverFunctionOptions<I, O>;
};
