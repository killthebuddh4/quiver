import { QuiverContext } from "./types/QuiverContext.js";
import { QuiverUse } from "./types/QuiverUse.js";
import { QuiverRoute } from "./types/QuiverRoute.js";
import { QuiverRouter } from "./types/QuiverRouter.js";
import { QuiverApi } from "./types/QuiverApi.js";

export const createRouter = <Api extends QuiverApi>(
  namespace: string,
  api: Api,
): QuiverRouter => {
  let init: {
    use: QuiverUse;
  } | null = null;

  const match = (ctx: QuiverContext) => {
    if (ctx.path?.channel !== "requests") {
      return false;
    }

    if (ctx.path?.namespace !== namespace) {
      return false;
    }

    return true;
  };

  const routes: QuiverRoute[] = Object.entries(api).map(([name, fn]) => {
    return {
      match: (ctx: QuiverContext) => {
        return ctx.path?.function === name;
      },
      function: fn,
    };
  });

  const bind = (use: QuiverUse) => {
    init = { use };

    return {
      use,
      bind,
      match,
      routes,
    };
  };

  const use: QuiverUse = (...args) => {
    if (init == null) {
      throw new Error("Client hasn't been bound to Quiver yet");
    }

    init.use(...args);
  };

  return { use, bind, match, routes };
};
