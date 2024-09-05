import { QuiverRouter } from "../quiver/QuiverRouter.js";
import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverNamespace = {
  [name: string]: QuiverRouter<any, any, any> | QuiverFunction<any, any>;
};
