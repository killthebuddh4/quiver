import { QuiverHook } from "../types/QuiverHook.js";
import { store } from "./store.js";

export const addHook = (id: string, hook: QuiverHook) => {
  const state = store.get(id);

  if (state === undefined) {
    throw new Error(`State with id ${id} not found`);
  }

  const found = state.hooks.find((h) => h.name === hook.name);

  if (found !== undefined) {
    throw new Error(`Hook with name ${hook.name} already exists`);
  }

  state.hooks.push(hook);
};
