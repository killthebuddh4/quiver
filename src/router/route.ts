import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

type RouteResult = {
  success: boolean;
  path: string[];
  matched: string[];
  middlewares: Array<QuiverMiddleware<any, any, any, any>>;
  function: ((i: any, ctx: any) => any) | null;
  message?: string;
};

export const route = (
  path: string[],
  router: QuiverRouter<any, any, any> | QuiverFunction<any>,
): RouteResult => {
  const result: RouteResult = {
    success: false,
    path,
    matched: [],
    middlewares: [],
    function: null,
  };

  if (path.length === 0) {
    if (typeof router === "function") {
      return {
        ...result,
        success: true,
        function: router,
      };
    }
  }

  let next: undefined | QuiverFunction<any> | QuiverRouter<any, any, any> =
    router;

  if (typeof next !== "function") {
    result.middlewares.push(next.mw);
  }

  for (const segment of path) {
    if (typeof next === "function") {
      return {
        ...result,
        message: `Arrived at leaf but path has more segments`,
      };
    }

    next = next.route(segment);

    if (next === undefined) {
      return {
        ...result,
        message: `Missing route after ${result.matched.join("/")}`,
      };
    }

    result.matched.push(segment);

    if (typeof next !== "function") {
      result.middlewares.push(next.mw);
    }
  }

  if (typeof next !== "function") {
    if (typeof next.routes["/"] !== "function") {
      return {
        ...result,
        message: `Expected function at leaf but got router`,
      };
    }

    return {
      ...result,
      success: true,
      function: next.routes["/"],
    };
  }

  return {
    ...result,
    success: true,
    function: next,
  };
};
