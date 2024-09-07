import { QuiverApp } from "./QuiverApp.js";
import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverClient<R extends QuiverApp<any, any>> = {
  [K in keyof R["routes"]]: R["routes"][K] extends QuiverFunction<any>
    ? (
        i: Parameters<R["routes"][K]["fn"]>[0],
      ) => ReturnType<R["routes"][K]["fn"]>
    : R["routes"][K] extends QuiverApp<any, any>
      ? QuiverClient<R["routes"][K]>
      : never;
};
