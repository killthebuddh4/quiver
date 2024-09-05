import { QuiverOptions } from "./QuiverOptions.js";
import { QuiverRoute } from "./QuiverRoute.js";
import { QuiverClientRoute } from "./QuiverClientRoute.js";
import { QuiverRegistry } from "./QuiverHook.js";
import { Fig } from "./Fig.js";

export type QuiverState = {
  fig: Fig;
  hooks: QuiverRegistry[];
  routes: QuiverRoute[];
  clients: QuiverClientRoute[];
  options?: QuiverOptions;
  subscriber?: {
    unsubscribe: () => void;
  };
};
