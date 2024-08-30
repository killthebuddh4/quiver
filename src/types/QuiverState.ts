import { QuiverOptions } from "./QuiverOptions.js";
import { QuiverHook } from "./QuiverHook.js";
import { QuiverRoute } from "./QuiverRoute.js";
import { QuiverContext } from "./QuiverContext.js";

export type QuiverState = {
  id: string;
  hooks: {
    message: QuiverHook;
    path: QuiverHook;
    json: QuiverHook;
    request: QuiverHook;
    response: QuiverHook;
    router: QuiverHook;
    route: QuiverHook;
    client: QuiverHook;
    resolver: QuiverHook;
    function: QuiverHook;
    input: QuiverHook;
    output: QuiverHook;
    throw: {
      quiver: QuiverHook;
      client: (ctx: QuiverContext) => QuiverHook;
      router: (ctx: QuiverContext) => QuiverHook;
    };
    return: {
      quiver: QuiverHook;
      client: (ctx: QuiverContext) => QuiverHook;
      router: (ctx: QuiverContext) => QuiverHook;
    };
    exit: {
      quiver: QuiverHook;
      client: (ctx: QuiverContext) => QuiverHook;
      router: (ctx: QuiverContext) => QuiverHook;
    };
  };
  routes: QuiverRoute[];
  options?: QuiverOptions;
  unsubscribe?: () => void;
};
