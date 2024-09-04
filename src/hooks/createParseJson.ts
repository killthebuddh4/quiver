import { QuiverHandler } from "../types/QuiverHandler.js";

export const createParseJson = (): QuiverHandler => {
  return async (context) => {
    try {
      const json = JSON.parse(String(context.received.content));

      context.json = json;
    } catch (error) {
      context.throw = {
        status: "INPUT_INVALID_JSON",
        reason: "Failed to parse message as JSON",
      };
    }

    return context;
  };
};
