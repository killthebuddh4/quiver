import { QuiverFunction } from "../types/QuiverFunction.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";

type RouteResult = {
  success: boolean;
  path: string[];
  matched: string[];
  middlewares: Array<{
    segment: string;
    middleware: QuiverMiddleware<any, any, any, any> | null;
  }>;
  function: QuiverFunction<any, any, any> | null;
  message?: string;
};

export const route = (
  path: string[],
  router: QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
): RouteResult => {
  const middlewares: Array<QuiverMiddleware<any, any, any, any>> = [];

  const result: RouteResult = {
    success: false,
    path,
    matched: [],
    middlewares: [],
    function: null,
  };

  if (router.type === "QUIVER_FUNCTION") {
    if (path.length > 0) {
      return result;
    }

    return {
      ...result,
      success: true,
      function: router,
      message: "Root is function but path has segments",
    };
  }

  if (path.length === 0) {
    return result;
  }

  let next:
    | undefined
    | QuiverFunction<any, any, any>
    | QuiverRouter<any, any, any> = router;

  middlewares.push(next.middleware);

  for (const segment of path) {
    if (next.type === "QUIVER_FUNCTION") {
      return {
        ...result,
        message: `Arrived at leaf but path has more segments`,
      };
    }

    next = next.next(segment);

    if (next === undefined) {
      return {
        ...result,
        message: `Missing route after ${result.matched.join("/")}`,
      };
    }

    result.matched.push(segment);

    if (next.type === "QUIVER_ROUTER") {
      middlewares.push(next.middleware);
    }
  }

  if (next.type === "QUIVER_ROUTER") {
    return {
      ...result,
      message: `Expected function at leaf but got router`,
    };
  }

  return {
    ...result,
    success: true,
    function: next,
  };
};
