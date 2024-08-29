import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

export const createExit = (): QuiverMiddleware => {
  return {
    name: "exit",
    handler: (x) => x,
  };
};
