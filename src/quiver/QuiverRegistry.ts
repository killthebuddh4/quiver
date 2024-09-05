import { QuiverHandler } from "../types/QuiverHandler.js";
import { QuiverHookName } from "../types/QuiverHookName.js";

export type QuiverRegistry = {
  [hook in QuiverHookName]: QuiverHandler<any, any>[];
};
