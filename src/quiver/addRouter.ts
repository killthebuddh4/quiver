import { QuiverRouter } from "../types/QuiverRouter.js";
import { store } from "./store.js";

export const addRouter = (id: string, router: QuiverRouter) => {
  const state = store.get(id);

  if (state === undefined) {
    throw new Error(`State with id ${id} not found`);
  }

  state.routers.push(router);
};
