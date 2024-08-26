import { QuiverContext } from "./QuiverContext.js";
import { QuiverError } from "./QuiverError.js";

export type QuiverThrow = (
  res: Omit<QuiverError, "id" | "ok">,
) => Promise<QuiverContext>;
