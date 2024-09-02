import { QuiverHandler } from "../types/QuiverHandler.js";

export const createJson = () => {
  const handler: QuiverHandler = async (context) => {
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
  return {
    name: "json",
    handler,
  };
};
