import { z } from "zod";
import * as Brpc from "./types/brpc.js";

export const createFunction = <I = undefined, O = undefined>(args: {
  input?: z.ZodType<I>;
  output?: z.ZodType<O>;
  auth: Brpc.BrpcAuth;
  handler: (i: I, context: Brpc.BrpcContext) => Promise<O>;
}): Brpc.BrpcProcedure<z.ZodType<I>, z.ZodType<O>> => {
  return {
    input: args.input ?? z.any(),
    output: args.output ?? z.any(),
    auth: args.auth,
    handler: args.handler,
  };
};
