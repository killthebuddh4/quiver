import { QuiverContext } from "./QuiverContext.js";
import { QuiverFunctionOptions } from "./QuiverFunctionOptions.js";
import { QuiverParser } from "./QuiverParser.js";

export type QuiverFunction<I, O> = {
  input: QuiverParser<I>;
  output: QuiverParser<O>;
  handler: (i: I, context: QuiverContext) => Promise<O>;
  options?: QuiverFunctionOptions<I, O>;
};
