import { QuiverContext } from "./QuiverContext.js";
import { QuiverThrow } from "./QuiverError.js";

export type QuiverThrow = (
  res: Omit<QuiverThrow, "id" | "ok">,
) => Promise<QuiverContext>;
