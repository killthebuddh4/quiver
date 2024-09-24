import { LeftOverlap } from "../util/LeftOverlap.js";
import { RightOverlap } from "../util/RightOverlap.js";

// This implements "if they overlap, then the overlapping part of the output
// extends the overlapping part of the input"

export type PipeableCtxIn<CtxOutMw, CtxInFn> =
  Extract<keyof CtxOutMw, keyof CtxInFn> extends never
    ? CtxInFn
    : LeftOverlap<CtxOutMw, CtxInFn> extends RightOverlap<CtxOutMw, CtxInFn>
      ? CtxInFn
      : never;
