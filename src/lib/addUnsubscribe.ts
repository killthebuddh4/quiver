import { store } from "./store.js";

export const addUnsubscribe = (id: string, unsubscribe: () => void) => {
  const state = store.get(id);

  if (state === undefined) {
    throw new Error(`State with id ${id} not found`);
  }

  state.unsubscribe = () => {
    state.unsubscribe = undefined;

    unsubscribe();
  };
};
