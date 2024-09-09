import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverFunction } from "../types/QuiverFunction.js";

export const getMiddleware = (
  path: string[],
  router: QuiverRouter<any, any>,
): Array<(ctx: any) => any> => {
  if (path.length === 0) {
    throw new Error("Path cannot be empty");
  }

  const middleware: Array<(ctx: any) => any> = [];

  let next: QuiverRouter<any, any> | QuiverFunction<any, any> = router;

  for (const segment of path) {
    middleware.push(next.use);

    if (!("routes" in next)) {
      throw new Error("Path is too long");
    }

    next = next.routes[segment];

    if (next === undefined) {
      throw new Error(`Next layer not found for path segment "${segment}"`);
    }
  }

  return middleware;
};
