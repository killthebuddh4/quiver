import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverFunction } from "../types/QuiverFunction.js";
import { Maybe } from "../types/util/Maybe.js";

export const getFunction = (
  path: string[],
  app: QuiverRouter<any, any>,
): Maybe<QuiverFunction<any, any>> => {
  if (path.length === 0) {
    throw new Error("Path cannot be empty");
  }

  let next: QuiverRouter<any, any> | QuiverFunction<any, any> = app;

  for (const segment of path) {
    if (!("routes" in next)) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
        reason: "Path is too long",
      };
    }

    next = next.routes[segment];

    if (next === undefined) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
        reason: `Next layer not found for path segment "${segment}"`,
      };
    }
  }

  if (!("fn" in next)) {
    return {
      ok: false,
      code: "FUNCTION_NOT_FOUND",
      reason: "Path is too short",
    };
  }

  return {
    ok: true,
    value: next,
  };
};
