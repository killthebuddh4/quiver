import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

export const createMessage = (): QuiverMiddleware => {
  return {
    name: "message",
    handler: (x) => x,
  };
};
