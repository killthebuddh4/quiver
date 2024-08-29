import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { parseQuiverPath } from "../lib/parseQuiverPath.js";
import { QuiverHandler } from "../types/QuiverHandler.js";

export const createPath = (): QuiverMiddleware => {
  const handler: QuiverHandler = async (context) => {
    const path = parseQuiverPath(context.received);

    if (!path.ok) {
      context.throw = {
        status: "INVALID_PATH",
        reason: `Failed to parse message because ${path.reason}`,
      };
    } else {
      context.path = path.value;
    }

    return context;
  };

  return { name: "path", handler };
};
