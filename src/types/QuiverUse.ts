import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverUse<O, Nxt> = (
  handler: QuiverHandler<O, Nxt>,
) => QuiverUse<Nxt, any>;
