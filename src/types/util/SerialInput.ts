import { LeftOverlap } from "./LeftOverlap.js";
import { RightOverlap } from "./RightOverlap.js";

// This implements "if they overlap, then the overlapping part of the output
// extends the overlapping part of the input"

export type SerialInput<CtxOutMw, CtxInFn> =
  Extract<keyof CtxOutMw, keyof CtxInFn> extends never
    ? CtxInFn
    : LeftOverlap<CtxOutMw, CtxInFn> extends RightOverlap<CtxOutMw, CtxInFn>
      ? CtxInFn
      : never;
