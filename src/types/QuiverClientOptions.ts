import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverClientOptions = {
  timeoutMs?: number;
  middleware?: QuiverMiddleware[];
};
