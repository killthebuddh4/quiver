import { RightOverlap } from "../util/RightOverlap.js";
import { LeftOverlap } from "../util/LeftOverlap.js";

export type ExtendingCtxIn<CtxInMw, CtxInNext> =
  Extract<keyof CtxInMw, keyof CtxInNext> extends never
    ? CtxInNext
    : RightOverlap<CtxInMw, CtxInNext> extends LeftOverlap<CtxInMw, CtxInNext>
      ? CtxInNext
      : LeftOverlap<CtxInMw, CtxInNext> extends RightOverlap<CtxInMw, CtxInNext>
        ? CtxInNext
        : never;
