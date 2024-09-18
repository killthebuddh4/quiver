import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverRouter } from "./QuiverRouter.js";

export interface QuiverApp {
  address: () => string;

  server: QuiverFunction<any, any, any> | QuiverRouter<any, any, any>;

  stop: () => void;

  listen: () => Promise<QuiverApp>;
}
