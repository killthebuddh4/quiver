import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverRoute<I, O> = QuiverRouter<I> | QuiverFunction<any, I, O>;
