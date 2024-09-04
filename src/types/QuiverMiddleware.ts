import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverMiddleware<I, O> = {
  use: <N>(handler: QuiverHandler<O, N>) => QuiverMiddleware<I, N>;
  run: QuiverHandler<I, O>;
};
