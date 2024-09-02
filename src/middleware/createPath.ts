import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { parseQuiverUrl } from "../lib/parseQuiverUrl.js";
import { QuiverHandler } from "../types/QuiverHandler.js";

export const createPath = (): QuiverMiddleware => {
  const handler: QuiverHandler = async (context) => {
    const path = parseQuiverUrl(context.received);

    if (!path.ok) {
      context.throw = {
        status: "INVALID_PATH",
        reason: `Failed to parse message because ${path.reason}`,
      };
    } else {
      context.url = path.value;
    }

    return context;
  };

  return { name: "path", handler };
};
