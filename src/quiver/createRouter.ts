import { Maybe } from "../types/util/Maybe.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { NewKey } from "../types/util/NewKey.js";
import { Resolve } from "../types/util/Resolve.js";
import { SerialExtension } from "../types/util/SerialExtension.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { createMiddleware } from "./createMiddleware.js";
import { SerialExtendedCtxIn } from "../types/util/SerialExtendedCtxIn.js";

export const createRouter = <
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]:
      | QuiverMiddleware<any, any, any, any>
      | QuiverRouter<any, any, any>;
  },
>(
  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>,
  routes: Routes,
): QuiverRouter<CtxIn, CtxOut, Routes> => {
  const type = "QUIVER_SWITCH" as const;

  const next = (
    path?: string[],
  ): Maybe<
    QuiverMiddleware<any, any, any, any> | QuiverRouter<any, any, any>
  > => {
    if (path === undefined || path.length === 0) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
      };
    }

    const nxt = routes[path[0]];

    if (nxt === undefined) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
      };
    }

    if (nxt.type === "QUIVER_MIDDLEWARE") {
      if (path.length > 1) {
        return {
          ok: false,
          code: "FUNCTION_NOT_FOUND",
        };
      }

      return {
        ok: true,
        value: nxt,
      };
    }

    return nxt.next(path.slice(1));
  };

  const use = <Exec>(
    path: NewKey<Routes>,
    fn: SerialExtension<CtxOut, Exec>,
  ) => {
    const route = createMiddleware<CtxOut, any, any, any>([[fn]]);

    (routes as any)[path] = route;

    return createRouter<
      Resolve<SerialExtendedCtxIn<CtxIn, CtxOut, Exec>>,
      CtxOut,
      Routes & { [key in string]: typeof route }
    >(middleware as any, routes as any) as any;
  };

  return { type, middleware, routes, next, use };
};
