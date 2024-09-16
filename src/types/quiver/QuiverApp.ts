import { QuiverProvider } from "../QuiverProvider.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverFunction } from "./QuiverFunction.js";

export interface QuiverApp<
  S extends QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
> {
  server: S;

  provider?: QuiverProvider;

  start: () => Promise<() => void>;

  stop: () => void;
}
