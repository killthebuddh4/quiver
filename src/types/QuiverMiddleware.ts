import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverMiddleware<I, O> = {
  use: <M>(handler: QuiverHandler<O, M>) => QuiverMiddleware<I, M>;
  run: QuiverHandler<I, O>;
};
