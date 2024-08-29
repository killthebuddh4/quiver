import { QuiverHandler } from "../types/QuiverHandler.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverResponse } from "../types/QuiverResponse.js";

export const createResolve = (
  queue: Map<string, (response: QuiverResponse<unknown>) => void>,
): QuiverMiddleware => {
  const handler: QuiverHandler = async (context) => {
    if (context.response === undefined) {
      context.error = {
        status: "SERVER_ERROR",
        reason: "Response not found in context",
      };

      return context;
    }

    const resolve = queue.get(context.response.id);

    if (resolve === undefined) {
      context.error = {
        status: "SERVER_ERROR",
        reason: "Response not found in queue",
      };
    }

    return context;
  };

  return { name: "resolve", handler };
};
