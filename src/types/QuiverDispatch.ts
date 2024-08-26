import { QuiverExit } from "./QuiverExit.js";
import { QuiverReturn } from "./QuiverReturn.js";
import { QuiverThrow } from "./QuiverThrow.js";

export type QuiverDispatch = {
  return: QuiverReturn;
  throw: QuiverThrow;
  exit: QuiverExit;
};
