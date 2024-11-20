import { InCtx } from "./InCtx.js";
import { RootCtx } from "../middleware/RootCtx.js";

export type RootFn<Fn> = RootCtx<InCtx<Fn>> extends 1 ? Fn : never;
