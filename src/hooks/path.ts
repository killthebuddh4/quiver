import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { parseQuiverPath } from "../lib/parseQuiverPath.js";
import { QuiverHandler } from "../types/QuiverHandler.js";

const handler: QuiverHandler = async (context) => {
  const path = parseQuiverPath(context.message);

  if (!path.ok) {
    context.error = {
      status: "INVALID_PATH",
      reason: "Failed to parse message path",
    };
  } else {
    context.path = path.value;
  }

  return context;
};

export const path: QuiverMiddleware = {
  name: "path",
  handler,
};
