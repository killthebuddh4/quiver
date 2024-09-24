import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { QuiverFunction } from "../types/QuiverFunction.js";

export const exec = (
  server: QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
  path: string[],
  context: { [key: string]: any },
) => {
  const middlewares: Array<QuiverMiddleware<any, any, any, any>> = [];

  if (server.type === "QUIVER_FUNCTION") {
    if (path.length > 0) {
      return {
        code: "NO_FUNCTION_FOR_PATH",
        message: `No function found for path: ${path.join("/")}. Root is a function but got a path with length > 0.`,
      };
    }

    middlewares.push(server.middleware);

    return server.middleware.exec(context);
  } else {
    if (path.length === 0) {
      return {
        code: "NO_FUNCTION_FOR_PATH",
        message: `No function found for path: ${path.join("/")}. Root is a router but got a path with length 0.`,
      };
    }

    let next:
      | undefined
      | QuiverFunction<any, any, any>
      | QuiverRouter<any, any, any> = server;

    middlewares.push(next.middleware);

    for (const segment of path) {
      if (next.type === "QUIVER_FUNCTION") {
        return {
          code: "NO_FUNCTION_FOR_PATH",
          message: `No function found for path: ${path.join("/")}. Reached a function before end of path.`,
        };
      }

      next = next.next(segment);

      if (next === undefined) {
        break;
      }

      middlewares.push(next.middleware);
    }

    if (next === undefined) {
      return {
        code: "NO_FUNCTION_FOR_PATH",
        message: `No function found for path: ${path.join("/")}`,
      };
    }

    if (next.type === "QUIVER_ROUTER") {
      return {
        code: "NO_FUNCTION_FOR_PATH",
        message: `No function found for path: ${path.join("/")}`,
      };
    }
  }

  let ctx = context;

  for (const middleware of middlewares) {
    ctx = {
      ...ctx,
      ...middleware.exec(ctx),
    };
  }

  return ctx;
};
