import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverHandler } from "../types/QuiverHandler.js";

export const createInput = (): QuiverMiddleware => {
  const handler: QuiverHandler = async (context) => {
    const request = context.request;

    if (request === undefined) {
      context.error = {
        status: "INVALID_REQUEST",
        reason: "Request not found in context",
      };
      return context;
    }

    return context;
  };

  return { name: "path", handler };
};
