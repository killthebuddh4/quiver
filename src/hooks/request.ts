import { QuiverHandler } from "../types/QuiverHandler.js";
import { parseQuiverRequest } from "../lib/parseQuiverRequest.js";

const handler: QuiverHandler = async (context) => {
  if (context.path === undefined) {
    context.error = {
      status: "SERVER_ERROR",
      reason: "Path not found in context",
    };

    return context;
  }

  if (context.path.channel !== "requests") {
    context.error = {
      status: "SERVER_ERROR",
      reason: "Path channel is not 'requests'",
    };
  }

  const request = parseQuiverRequest(context.message);

  if (!request.ok) {
    context.error = {
      status: "INVALID_REQUEST",
      reason: "Failed to parse message as Quiver request",
    };

    return context;
  }

  context.request = request.value;

  return context;
};

export const request = {
  name: "request",
  handler,
};
