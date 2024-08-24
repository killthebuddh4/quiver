import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverHandler } from "./QuiverHandler.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverApiSpec = {
  [key in string]: key extends "bind" | "use"
    ? key extends "bind"
      ? () => {
          namespace: string;
          handler: QuiverHandler;
        }
      : (mw: QuiverMiddleware) => void
    : Omit<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        QuiverFunction<any, any>,
        "handler"
      >;
};
