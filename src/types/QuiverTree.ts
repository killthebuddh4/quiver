import { QuiverRegistry } from "./QuiverHook.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverTree = {
  hooks: QuiverRegistry[];
  middleware: QuiverMiddleware;
  children: {
    [key: string]: QuiverTree;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function?: QuiverFunction<any, any>;
};
