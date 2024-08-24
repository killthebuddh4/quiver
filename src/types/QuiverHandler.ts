import { QuiverContext } from "./QuiverContext.js";

export type QuiverHandler = (context: QuiverContext) => Promise<void>;
