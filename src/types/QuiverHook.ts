import { QuiverHookName } from "./QuiverHookName.js";
import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverRegistry = {
  [key in QuiverHookName]: QuiverHandler<any, any>[];
};
