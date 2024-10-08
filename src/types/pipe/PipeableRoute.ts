import { PipeableCtxIn } from "./PipeableCtxIn.js";
import { QuiverRouter } from "../QuiverRouter.js";
import { QuiverFunction } from "../QuiverFunction.js";

// Serial functions with overlapping output -> input keys must have compatible
// types for the overlapping keys. The overlapping keys are compatible according
// if the input type extends the output type. See the imported type for the
// implementation of the above rule.
//
// Note that serial functions can have input keys that are NOT PRESENT in the
// output of the previous function. We allow this by extending the input type.
// Upstream middleware will then need to provide the values for these keys.

export type PipeableRoute<CtxOutMw, Next> =
  Next extends QuiverRouter<infer CtxInNext, any, any>
    ? PipeableCtxIn<CtxOutMw, CtxInNext> extends never
      ? never
      : Next
    : Next extends QuiverFunction<infer CtxInNext, any, any>
      ? PipeableCtxIn<CtxOutMw, CtxInNext> extends never
        ? never
        : Next
      : never;
