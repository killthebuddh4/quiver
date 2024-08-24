import { z } from "zod";
import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverFunctionOptions<I, O> = {
  input?: z.ZodType<I>;
  output?: z.ZodType<O>;
  middleware?: QuiverMiddleware[];
  isNotification?: boolean;
};
