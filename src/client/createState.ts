import { store } from "./store.js";
import { getUniqueId } from "../lib/getUniqueId.js";
import { QuiverClientState } from "../types/QuiverClientState.js";

export const createState = () => {
  const id = getUniqueId();

  const state: QuiverClientState = {
    id,
    hooks: [],
    queue: new Map(),
    controller: null,
  };

  store.set(id, state);

  return state;
};
