import { QuiverContext } from "./QuiverContext.js";
import { QuiverController } from "./QuiverController.js";
import { QuiverFunctionOptions } from "./QuiverFunctionOptions.js";
import { QuiverParser } from "./QuiverParser.js";

export type QuiverFunction<I, O> = {
  input: QuiverParser<I>;
  output: QuiverParser<O>;
  handler: (
    i: I,
    context: QuiverContext,
    controller: QuiverController,
  ) => Promise<O>;
  options?: QuiverFunctionOptions<I, O>;
};
