import { store } from "./store.js";
import { getUniqueId } from "./getUniqueId.js";
import { QuiverOptions } from "../types/QuiverOptions.js";

export const createState = (options?: QuiverOptions) => {
  const id = getUniqueId();

  const state = {
    id,
    options,
    hooks: [],
    routes: [],
  };

  store.set(id, state);

  return state;
};
