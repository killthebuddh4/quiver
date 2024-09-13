import { RightOverlap } from "./RightOverlap.js";
import { LeftOverlap } from "./LeftOverlap.js";

export type ParallelInput<CtxInMw, CtxInFn> =
  Extract<keyof CtxInMw, keyof CtxInFn> extends never
    ? CtxInFn
    : RightOverlap<CtxInMw, CtxInFn> extends LeftOverlap<CtxInMw, CtxInFn>
      ? CtxInFn
      : LeftOverlap<CtxInMw, CtxInFn> extends RightOverlap<CtxInMw, CtxInFn>
        ? CtxInFn
        : never;
