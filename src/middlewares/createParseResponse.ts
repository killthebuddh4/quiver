import { QuiverHandler } from "../types/QuiverHandler.js";
import { parseQuiverResponse } from "../lib/parseQuiverResponse.js";

export const createParseResponse = (): QuiverHandler => {
  return async (context) => {
    if (context.url === undefined) {
      context.throw = {
        status: "SERVER_ERROR",
        reason: "Path not found in context",
      };

      return context;
    }

    if (context.url.channel !== "responses") {
      return context;
    }

    const response = parseQuiverResponse(context.received);

    if (!response.ok) {
      context.throw = {
        status: "INVALID_RESPONSE",
        reason: "Failed to parse message as Quiver response",
      };

      return context;
    }

    context.response = response.value;

    return context;
  };
};
