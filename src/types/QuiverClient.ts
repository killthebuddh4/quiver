import { QuiverSuccess } from "./QuiverSuccess.js";
import { QuiverThrow } from "./QuiverError.js";
import { QuiverApiSpec } from "./QuiverApiSpec.js";
import { QuiverHandler } from "./QuiverHandler.js";
import { Actually } from "./Actually.js";

export type QuiverClient<A extends QuiverApiSpec> = {
  [K in keyof A | "bind" | "use"]: K extends "bind"
    ? () => {
        address: string;
        namespace: string;
        handler: QuiverHandler;
      }
    : K extends "use"
      ? (mw: QuiverHandler) => void
      : RemoveSingleUndefinedArgument<
          (
            i: Actually<ReturnType<A[K]["input"]>>,
          ) =>
            | Promise<QuiverSuccess<Actually<ReturnType<A[K]["output"]>>>>
            | QuiverThrow
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
