import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { QuiverRoute } from "./types/QuiverRoute.js";
import { QuiverNamespace } from "./types/QuiverNamespace.js";
import { createIdentity } from "./hooks/createIdentity.js";

export const createApi = <I, O>(
  middleware?: QuiverMiddleware<I, O> | null,
  routes?: {
    [key: string]: QuiverRoute<O, any>;
  } | null,
): QuiverNamespace<O> => {
  return {
    middleware: middleware ?? createIdentity(),
    routes: routes ?? {},
  };
};
