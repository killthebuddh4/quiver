import { store } from "./store.js";

export const getState = (id: string) => {
  const state = store.get(id);

  if (state === undefined) {
    throw new Error(`State with id ${id} not found`);
  }

  return state;
};
