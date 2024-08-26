import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverParser } from "./QuiverParser.js";

export type QuiverFunctionOptions<I, O> = {
  input?: QuiverParser<I>;
  output?: QuiverParser<O>;
  middleware?: QuiverMiddleware[];
  isNotification?: boolean;
};
