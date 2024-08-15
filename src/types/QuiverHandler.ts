import { QuiverContext } from "./QuiverContext.js";

export type QuiverHandler<I, O> = (i: I, context: QuiverContext) => Promise<O>;
