import { QuiverSuccess } from "./QuiverSuccess.js";

export type QuiverReturn = (
  res: Omit<QuiverSuccess<unknown>, "id" | "ok">,
) => Promise<void>;
