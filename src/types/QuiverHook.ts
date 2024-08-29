import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverHook = {
  name: string;
  mw: QuiverMiddleware;
  before: QuiverMiddleware[];
  after: QuiverMiddleware[];
  return: QuiverMiddleware[];
  throw: QuiverMiddleware[];
  exit: QuiverMiddleware[];
};
