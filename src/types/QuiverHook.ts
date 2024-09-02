import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverHook = {
  name: string;
  mw: QuiverMiddleware;
  before: QuiverMiddleware[];
  return: QuiverMiddleware[];
  throw: QuiverMiddleware[];
  exit: QuiverMiddleware[];
  after: QuiverMiddleware[];
  error: QuiverMiddleware[];
};
