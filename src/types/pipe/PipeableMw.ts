import { PipeableCtxIn } from "./PipeableCtxIn.js";
import { QuiverMiddleware } from "../QuiverMiddleware.js";

// Serial functions with overlapping output -> input keys must have compatible
// types for the overlapping keys. The overlapping keys are compatible according
// if the input type extends the output type. See the imported type for the
// implementation of the above rule.
//
// Note that serial functions can have input keys that are NOT PRESENT in the
// output of the previous function. We allow this by extending the input type.
// Upstream middleware will then need to provide the values for these keys.

export type PipeableMw<CtxOutMw, Next> =
  Next extends QuiverMiddleware<infer CtxInNext, any, any, any>
    ? PipeableCtxIn<CtxOutMw, CtxInNext> extends never
      ? never
      : Next
    : never;
