import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverRouterState = {
  id: string;
  hooks: QuiverMiddleware[];
};
