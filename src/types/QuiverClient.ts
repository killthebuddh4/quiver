import { z } from "zod";
import { QuiverSuccess } from "./QuiverSuccess.js";
import { QuiverError } from "./QuiverError.js";
import { QuiverApiSpec } from "./QuiverApiSpec.js";
import { QuiverHandler } from "./QuiverHandler.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverClient<A extends QuiverApiSpec> = {
  [K in keyof A | "bind" | "use"]: K extends "bind"
    ? () => {
        address: string;
        namespace: string;
        handler: QuiverHandler;
      }
    : K extends "use"
      ? (mw: QuiverMiddleware) => void
      : RemoveSingleUndefinedArgument<
          (
            i: z.infer<A[K]["input"]>,
          ) => Promise<QuiverSuccess<z.infer<A[K]["output"]>> | QuiverError>
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
