import { LeftOverlap } from "./LeftOverlap.js";
import { RightOverlap } from "./RightOverlap.js";

export type SerialInput<CtxOutMw, CtxInFn> =
  Extract<keyof CtxOutMw, keyof CtxInFn> extends never
    ? CtxInFn
    : RightOverlap<CtxOutMw, CtxInFn> extends LeftOverlap<CtxOutMw, CtxInFn>
      ? CtxInFn
      : never;
