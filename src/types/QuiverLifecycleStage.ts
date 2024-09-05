import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverLifecycleStage = {
  use: QuiverHandler<any, any>[];
  handler: QuiverHandler<any, any>;
  return: QuiverHandler<any, any>[];
  throw: QuiverHandler<any, any>[];
  exit: QuiverHandler<any, any>[];
};
