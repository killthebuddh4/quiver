import { QuiverHandler } from "../types/QuiverHandler.js";

const handler: QuiverHandler = async (context) => {
  try {
    const json = JSON.parse(String(context.message));

    context.json = json;
  } catch (error) {
    context.error = {
      status: "INPUT_INVALID_JSON",
      reason: "Failed to parse message as JSON",
    };
  }

  return context;
};

export const json = {
  name: "json",
  handler,
};
