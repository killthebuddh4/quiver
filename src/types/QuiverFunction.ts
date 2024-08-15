import { ZodType } from "zod";
import { QuiverAuth } from "./QuiverAuth.js";
import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverFunction<I, O> = {
  input: ZodType<I>;
  output: ZodType<O>;
  auth: QuiverAuth;
  handler: QuiverHandler<I, O>;
};
