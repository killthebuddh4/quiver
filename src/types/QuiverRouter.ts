import { QuiverRoute } from "./QuiverRoute.js";

export type QuiverRouter<I> = {
  middleware: I;
  routes: {
    [key: string]: QuiverRoute<I, any>;
  };
};
