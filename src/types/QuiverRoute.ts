import { QuiverFunction } from "../quiver/QuiverFunction.js";
import { QuiverRouter } from "../quiver/QuiverRouter.js";

export type QuiverRoute =
  | QuiverRouter<any, any, any>
  | QuiverFunction<any, any, any>;
