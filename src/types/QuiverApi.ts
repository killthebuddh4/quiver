import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverApi = {
  [key: string]: QuiverFunction<any, any> | QuiverApi;
};
