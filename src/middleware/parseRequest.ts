import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { parseQuiverRequest } from "../lib/parseQuiverRequest.js";

export const parseRequest: QuiverMiddleware = async (dispatch, context) => {
  const request = parseQuiverRequest(context.message);

  if (!request.ok) {
    dispatch.throw({
      status: "INVALID_REQUEST",
      reason: `No request found in message ${context.message.id}`,
    });

    return dispatch.exit();
  }

  return {
    ...context,
    metadata: {
      ...context.metadata,
      request: request.value,
    },
  };
};
