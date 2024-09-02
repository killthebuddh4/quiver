import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverController } from "../types/QuiverController.js";
import { QuiverHook } from "../types/QuiverHook.js";
import { QuiverHooks } from "../types/QuiverHooks.js";

export const getHook = (
  hook: QuiverHooks,
  ctx: QuiverContext,
  ctrl: QuiverController,
): QuiverHook => {
  return {
    hook,
    ctx,
    ctrl,
  } as unknown as QuiverHook;
};
