import { QuiverHandler } from "../types/QuiverHandler.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { parseQuiverRequest } from "../lib/parseQuiverRequest.js";

export const createRequest = (): QuiverMiddleware => {
  const handler: QuiverHandler = async (context) => {
    if (context.path === undefined) {
      context.throw = {
        status: "SERVER_ERROR",
        reason: "Path not found in context",
      };

      return context;
    }

    if (context.path.channel !== "requests") {
      context.throw = {
        status: "SERVER_ERROR",
        reason: "Path channel is not 'requests'",
      };
    }

    const request = parseQuiverRequest(context.received);

    if (!request.ok) {
      context.throw = {
        status: "INVALID_REQUEST",
        reason: "Failed to parse message as Quiver request",
      };

      return context;
    }

    context.request = request.value;

    return context;
  };

  return { name: "request", handler };
};
