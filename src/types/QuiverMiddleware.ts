import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverMiddleware = {
  name: string;
  handler: QuiverHandler;
};
