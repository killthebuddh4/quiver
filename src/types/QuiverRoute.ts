import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverRoute = {
  path: string[];
  function: QuiverFunction<unknown, unknown>;
};
