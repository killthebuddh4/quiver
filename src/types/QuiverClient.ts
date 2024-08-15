import { QuiverSuccess } from "./QuiverSuccess.js";
import { QuiverError } from "./QuiverError.js";
import { QuiverApiSpec } from "./QuiverApiSpec.js";

export type QuiverClient<A extends QuiverApiSpec> = {
  [K in keyof A]: WrapInQuiverResult<
    RemoveSingleUndefinedArgument<(i: A[K]["input"]) => Promise<A[K]["output"]>>
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

type QuiverResult<D> = QuiverSuccess<D> | QuiverError;

type WrapInQuiverResult<F> = F extends (...args: infer Args) => infer R
  ? (...args: Args) => Promise<QuiverResult<Awaited<R>>>
  : never;
