import { QuiverContext } from "./QuiverContext.js";

export type QuiverAuth = (args: { context: QuiverContext }) => Promise<boolean>;
