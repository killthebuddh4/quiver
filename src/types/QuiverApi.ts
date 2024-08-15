import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: QuiverFunction<any, any>;
};
