import { RootCtx } from "../middleware/RootCtx.js";
import { InCtx } from "../handler/InCtx.js";

export type RootHandler<F> = RootCtx<InCtx<F>> extends 1 ? F : never;
