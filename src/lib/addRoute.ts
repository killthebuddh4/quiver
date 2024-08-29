import { QuiverRoute } from "../types/QuiverRoute.js";
import { store } from "./store.js";

export const addRoute = (id: string, route: QuiverRoute) => {
  const state = store.get(id);

  if (state === undefined) {
    throw new Error(`State with id ${id} not found`);
  }

  state.routes.push(route);
};
