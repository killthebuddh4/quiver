import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverDispatch = {
  return: QuiverHandler;
  throw: QuiverHandler;
  exit: QuiverHandler;
};
