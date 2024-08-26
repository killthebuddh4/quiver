import { QuiverContext } from "./QuiverContext.js";
import { QuiverSuccess } from "./QuiverSuccess.js";

export type QuiverReturn = (
  res: Omit<QuiverSuccess<unknown>, "id" | "ok">,
) => Promise<QuiverContext>;
