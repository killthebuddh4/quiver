import { QuiverContext } from "./QuiverContext.js";
import { QuiverHook } from "./QuiverHook.js";

export type QuiverRunHook = (
  hook: QuiverHook,
  context: QuiverContext,
) => Promise<"return" | "throw" | "exit" | "error">;
