import { QuiverClientRouter } from "../types/QuiverClientRouter.js";
import { store } from "./store.js";

export const addClient = (id: string, router: QuiverClientRouter) => {
  const state = store.get(id);

  if (state === undefined) {
    throw new Error(`State with id ${id} not found`);
  }

  state.clients.push(router);
};
