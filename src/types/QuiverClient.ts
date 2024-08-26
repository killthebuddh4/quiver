import { QuiverSuccess } from "./QuiverSuccess.js";
import { QuiverError } from "./QuiverError.js";
import { QuiverApiSpec } from "./QuiverApiSpec.js";
import { QuiverClientHandler } from "./QuiverClientHandler.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { Actually } from "./Actually.js";

export type QuiverClient<A extends QuiverApiSpec> = {
  [K in keyof A | "bind" | "use"]: K extends "bind"
    ? () => {
        address: string;
        namespace: string;
        handler: QuiverClientHandler;
      }
    : K extends "use"
      ? (mw: QuiverMiddleware) => void
      : RemoveSingleUndefinedArgument<
          (
            i: Actually<ReturnType<A[K]["input"]>>,
          ) =>
            | Promise<QuiverSuccess<Actually<ReturnType<A[K]["output"]>>>>
            | QuiverError
        >;
};

type RemoveSingleUndefinedArgument<F> = F extends (
  arg: infer First,
  ...args: infer Rest
) => infer R
  ? First extends undefined
    ? Rest extends []
      ? (...args: Rest) => R
      : F
    : F
  : never;
