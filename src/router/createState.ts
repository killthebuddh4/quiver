import { store } from "./store.js";
import { getUniqueId } from "../quiver/getUniqueId.js";
import { QuiverRouterState } from "../types/QuiverRouterState.js";

export const createState = () => {
  const id = getUniqueId();

  const state: QuiverRouterState = {
    id,
    hooks: [],
  };

  console.log(`Setting id ${id} in store`);
  store.set(id, state);

  return state;
};
