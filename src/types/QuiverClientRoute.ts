import { QuiverClientResolve } from "./QuiverClientResolve.js";

export type QuiverClientRoute = {
  id: string;
  path: string[];
  resolve: QuiverClientResolve;
};
