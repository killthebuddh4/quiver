import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverFunction } from "../types/QuiverFunction.js";

export const exec = (
  server: QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
  path: string[],
  context: QuiverContext,
) => {
  const middlewares: Array<QuiverMiddleware<any, any, any, any>> = [];

  if (server.type === "QUIVER_FUNCTION") {
    if (path.length > 0) {
      return {
        code: "NO_FUNCTION_FOR_PATH",
        message: `No function found for path: ${path.join("/")}, ${path}`,
      };
    }

    middlewares.push(server.middleware);

    return server.middleware.exec(context);
  } else {
    if (path.length === 0) {
      return {
        code: "NO_FUNCTION_FOR_PATH",
        message: `No function found for path: ${path.join("/")}, ${path}`,
      };
    }

    let next:
      | undefined
      | QuiverFunction<any, any, any>
      | QuiverRouter<any, any, any> = server;

    middlewares.push(next.middleware);

    for (const segment of path) {
      next = server.next(segment);

      if (next === undefined) {
        break;
      }

      middlewares.push(next.middleware);
    }

    if (next === undefined) {
      return {
        code: "NO_FUNCTION_FOR_PATH",
        message: `No function found for path: ${path.join("/")}, ${path}`,
      };
    }

    if (next.type === "QUIVER_ROUTER") {
      return {
        code: "NO_FUNCTION_FOR_PATH",
        message: `No function found for path: ${path.join("/")}, ${path}`,
      };
    }
  }

  let ctx = context;

  for (const middleware of middlewares) {
    ctx = middleware.exec(ctx);
  }

  return ctx;
};
