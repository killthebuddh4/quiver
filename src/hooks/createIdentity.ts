import { QuiverHandler } from "../types/QuiverHandler.js";

export const createIdentity = (): QuiverHandler => {
  return (x) => x;
};
