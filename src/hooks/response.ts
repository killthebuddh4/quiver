import { QuiverHandler } from "../types/QuiverHandler.js";
import { parseQuiverResponse } from "../lib/parseQuiverResponse.js";

const handler: QuiverHandler = async (context) => {
  if (context.path === undefined) {
    context.error = {
      status: "SERVER_ERROR",
      reason: "Path not found in context",
    };

    return context;
  }

  if (context.path.channel !== "responses") {
    context.error = {
      status: "SERVER_ERROR",
      reason: "Path channel is not 'responses'",
    };
  }

  const response = parseQuiverResponse(context.message);

  if (!response.ok) {
    context.error = {
      status: "INVALID_RESPONSE",
      reason: "Failed to parse message as Quiver response",
    };

    return context;
  }

  context.response = response.value;

  return context;
};

export const response = {
  name: "response",
  handler,
};
