import { QuiverOptions } from "./QuiverOptions.js";
import { QuiverHook } from "./QuiverHook.js";
import { QuiverContext } from "./QuiverContext.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverClientRouter } from "./QuiverClientRouter.js";

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
  routers: QuiverRouter[];
  clients: QuiverClientRouter[];
  options?: QuiverOptions;
  unsubscribe?: () => void;
};
