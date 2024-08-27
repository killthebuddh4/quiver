import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverHook = {
  before: QuiverMiddleware[];
  after: QuiverMiddleware[];
  catch: QuiverMiddleware[];
  mw: QuiverMiddleware;
};
