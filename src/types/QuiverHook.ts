import { QuiverHookName } from "./QuiverHookName.js";
import { QuiverHandler } from "./QuiverHandler.js";
import { QuiverHookEvent } from "./QuiverHookEvent.js";

export type QuiverHook = {
  name: QuiverHookName;
  event: QuiverHookEvent;
  path: string[];
  handler: QuiverHandler;
};
