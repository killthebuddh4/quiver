import { QuiverOptions } from "./QuiverOptions.js";
import { QuiverHook } from "./QuiverHook.js";
import { QuiverRoute } from "./QuiverRoute.js";

export type QuiverState = {
  id: string;
  hooks: QuiverHook[];
  routes: QuiverRoute[];
  options?: QuiverOptions;
  unsubscribe?: () => void;
};
