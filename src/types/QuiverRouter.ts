import { QuiverUse } from "./QuiverUse.js";

export type QuiverRouter<I, M, R> = {
  use: QuiverUse<M, any>;
};
