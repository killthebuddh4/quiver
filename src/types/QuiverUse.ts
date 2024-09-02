import { QuiverHookEvent } from "./QuiverHookEvent.js";
import { QuiverHandler } from "./QuiverHandler.js";
import { QuiverHookName } from "./QuiverHookName.js";

export type QuiverUse = (
  name: QuiverHookName,
  event: QuiverHookEvent,
  path: string[],
  handler: QuiverHandler,
) => void;
