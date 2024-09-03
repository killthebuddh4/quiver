import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { QuiverRoute } from "./types/QuiverRoute.js";
import { QuiverRouter } from "./types/QuiverRouter.js";
import { createIdentity } from "./middlewares/createIdentity.js";

export const createRouter = <I, O>(
  middleware?: QuiverMiddleware<I, O> | null,
  routes?: {
    [key: string]: QuiverRoute<O, any>;
  } | null,
): QuiverRouter<O> => {
  return {
    middleware: middleware ?? createIdentity(),
    routes: routes ?? {},
  };
};
