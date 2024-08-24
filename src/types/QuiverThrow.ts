import { QuiverError } from "./QuiverError.js";

export type QuiverThrow = (
  res: Omit<QuiverError, "id" | "ok">,
) => Promise<void>;
