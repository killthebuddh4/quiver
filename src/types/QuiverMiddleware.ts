import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverMiddleware = {
  handler: QuiverHandler;
  before: QuiverHandler[];
  return: QuiverHandler[];
  throw: QuiverHandler[];
  exit: QuiverHandler[];
  after: QuiverHandler[];
  error: QuiverHandler[];
};
