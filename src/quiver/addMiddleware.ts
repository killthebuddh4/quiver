import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverHookEvent } from "../types/QuiverHookEvent.js";
import { store } from "../quiver/store.js";

export const addMiddleware = (
  id: string,
  to: string,
  on: QuiverHookEvent,
  mw: QuiverMiddleware,
) => {
  const state = store.get(id);

  if (state === undefined) {
    throw new Error(`State with id ${id} not found`);
  }

  const hook = state.hooks.find((h) => h.name === to);

  if (hook === undefined) {
    throw new Error(`Hook with name ${to} not found`);
  }

  switch (on) {
    case "before":
      hook.before.push(mw);

      break;
    case "after":
      hook.after.push(mw);

      break;
    case "return":
      hook.return.push(mw);

      break;
    case "throw":
      hook.throw.push(mw);

      break;
    case "exit":
      hook.exit.push(mw);

      break;
  }
};
