import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverClient<R extends QuiverRouter<any, any>> = {
  [K in keyof R["routes"]]: R["routes"][K] extends QuiverFunction<any, any>
    ? (
        i: Parameters<R["routes"][K]["fn"]>[0],
      ) => ReturnType<R["routes"][K]["fn"]>
    : R["routes"][K] extends QuiverRouter<any, any>
      ? QuiverClient<R["routes"][K]>
      : never;
};
