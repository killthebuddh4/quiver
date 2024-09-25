import { QuiverMiddleware } from "../QuiverMiddleware.js";
import { ExtendingCtxIn } from "./ExtendingCtxIn.js";
import { ExtendingCtxOut } from "./ExtendingCtxOut.js";

// Parallel functions with overlapping input keys must have compatible types for
// the overlapping keys. The overlapping keys are compatible if one side's type
// extends the other. They are compatible because we can intersect the input
// types to create the total input type. Parallel functions must not have
// overlapping output keys.
//
// See the imported types for implementations of the above rules.

export type ExtendingMw<CtxInMw, CtxOutMw, Next> =
  Next extends QuiverMiddleware<infer CtxInNext, infer CtxOutNext, any, any>
    ? CtxInMw extends undefined
      ? Next
      : ExtendingCtxIn<CtxInMw, CtxInNext> extends never
        ? never
        : ExtendingCtxOut<CtxOutMw, CtxOutNext> extends never
          ? never
          : Next
    : never;
