import { QuiverUrl } from "../types/QuiverUrl.js";
import { QuiverResult } from "../types/QuiverResult.js";

export const createProxy = (
  url: QuiverUrl,
  call: (url: QuiverUrl, args: any[]) => Promise<QuiverResult<unknown>>,
) => {
  return new Proxy(() => null, {
    get: (_1, prop) => {
      if (typeof prop !== "string") {
        throw new Error(`Expected string, got ${typeof prop}`);
      }

      return createProxy(
        {
          ...url,
          path: [...url.path, prop],
        },
        call,
      );
    },

    apply: (_1, _2, args) => {
      return call(url, args[0] || null);
    },
  });
};
