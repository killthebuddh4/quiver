import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverController } from "./QuiverController.js";
import { QuiverResponse } from "./QuiverResponse.js";

export type QuiverClientState = {
  id: string;
  hooks: QuiverMiddleware[];
  controller: QuiverController | null;
  queue: Map<string, (response: QuiverResponse<unknown>) => void>;
};
