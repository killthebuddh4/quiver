import { QuiverHandler } from "../types/QuiverHandler.js";

export const createExit = (): QuiverHandler => {
  return (x) => x;
};
