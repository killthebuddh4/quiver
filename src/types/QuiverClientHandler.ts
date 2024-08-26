import { QuiverClientContext } from "./QuiverClientContext.js";

export type QuiverClientHandler = (
  context: QuiverClientContext,
) => Promise<void>;
