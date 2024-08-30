import { QuiverClientRoute } from "./QuiverClientRoute.js";
import { QuiverMatch } from "./QuiverMatch.js";

export type QuiverClientRouter = {
  match: QuiverMatch;
  routes: QuiverClientRoute[];
};
