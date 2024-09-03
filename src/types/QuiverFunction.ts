import { QuiverController } from "./QuiverController.js";
import { QuiverFunctionOptions } from "./QuiverFunctionOptions.js";
import { QuiverParser } from "./QuiverParser.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverFunction<I, C, O> = {
  middleware: QuiverMiddleware;
  input: QuiverParser<I>;
  output: QuiverParser<O>;
  function: (i: I, context: C, controller: QuiverController) => Promise<O>;
  options?: QuiverFunctionOptions<I, O>;
};
