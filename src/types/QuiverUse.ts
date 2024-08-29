import { QuiverHookEvent } from "./QuiverHookEvent.js";
import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverUse = (
  hook: string,
  event: QuiverHookEvent,
  name: string,
  handler: QuiverHandler,
) => void;
