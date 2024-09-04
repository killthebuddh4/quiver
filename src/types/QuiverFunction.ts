import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverFunction<I, O> = {
  before: <N>(handler: QuiverHandler<I, N>) => QuiverFunction<N, O>;
  after: <N>(handler: QuiverHandler<O, N>) => QuiverFunction<I, N>;
  bind: (handler: QuiverHandler<I, O>) => QuiverFunction<I, O>;
  run: QuiverHandler<I, O>;
};
