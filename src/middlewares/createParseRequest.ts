import { QuiverHandler } from "../types/QuiverHandler.js";
import { parseQuiverRequest } from "../lib/parseQuiverRequest.js";

export const createParseRequest = (): QuiverHandler => {
  return (context) => {
    if (context.url === undefined) {
      context.throw = {
        status: "SERVER_ERROR",
        reason: "Path not found in context",
      };

      return context;
    }

    if (context.url.channel !== "requests") {
      return context;
    }

    const request = parseQuiverRequest(context.received.content);

    if (!request.ok) {
      context.throw = {
        status: "INVALID_REQUEST",
        reason: request.reason,
      };

      return context;
    }

    context.request = request.value;

    return context;
  };
};
