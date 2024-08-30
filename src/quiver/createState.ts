import { store } from "./store.js";
import { getUniqueId } from "../lib/getUniqueId.js";
import { QuiverOptions } from "../types/QuiverOptions.js";
import { QuiverState } from "../types/QuiverState.js";

export const createState = (options?: QuiverOptions) => {
  const id = getUniqueId();

  const state = { options } as QuiverState;

  store.set(id, state);

  return state;
};
