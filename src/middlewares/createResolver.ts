import { QuiverHandler } from "../types/QuiverHandler.js";

export const createGetClient = (): QuiverHandler => {
  return (x) => x;
};
