import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { store } from "./store.js";
import { QuiverHandler } from "../types/QuiverHandler.js";
import { QuiverHookName } from "../types/QuiverHookName.js";

const MAX_DEPTH = 10;

export const createMiddleware = (
  id: string,
  name: QuiverHookName,
  path: string[],
  handler: QuiverHandler,
): QuiverMiddleware => {
  const state = store.get(id);

  if (state === undefined) {
    throw new Error(`Quiver state with id "${id}" not found`);
  }

  const mw: QuiverMiddleware = {
    handler,
    before: [],
    after: [],
    exit: [],
    throw: [],
    return: [],
    error: [],
  };

  for (let len = 0; len < MAX_DEPTH; len++) {
    for (const hook of state.hooks) {
      if (hook.name !== name) {
        continue;
      }

      if (hook.path.length !== len) {
        continue;
      }

      for (let i = 0; i < len; i++) {
        if (hook.path[i] !== path[i]) {
          continue;
        }
      }

      switch (hook.event) {
        case "before":
          mw.before.unshift(hook.handler);
          break;
        case "after":
          mw.after.push(hook.handler);
          break;
        case "exit":
          mw.exit.push(hook.handler);
          break;
        case "throw":
          mw.throw.push(hook.handler);
          break;
        case "return":
          mw.return.push(hook.handler);
          break;
      }
    }
  }

  return mw;
};
