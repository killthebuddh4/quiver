import { QuiverApp } from "../types/QuiverApp.js";
import { QuiverFunction } from "../types/QuiverFunction.js";

export const getMiddleware = (
  path: string[],
  app: QuiverApp<any, any>,
): Array<(ctx: any) => any> => {
  if (path.length === 0) {
    throw new Error("Path cannot be empty");
  }

  const middleware: Array<(ctx: any) => any> = [];

  let next: QuiverApp<any, any> | QuiverFunction<any> = app;

  for (const segment of path) {
    middleware.push(next.middleware);

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
