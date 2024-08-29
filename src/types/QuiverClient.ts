import { QuiverSuccess } from "./QuiverSuccess.js";
import { QuiverError } from "./QuiverError.js";
import { QuiverApiSpec } from "./QuiverApiSpec.js";
import { Actually } from "./Actually.js";
import { QuiverController } from "./QuiverController.js";
import { QuiverRoute } from "./QuiverRoute.js";
import { QuiverUse } from "./QuiverUse.js";

export type QuiverClient<A extends QuiverApiSpec> = {
  [K in keyof A | "bind" | "use"]: K extends "bind"
    ? (ctrl: QuiverController) => QuiverRoute
    : K extends "use"
      ? QuiverUse
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
