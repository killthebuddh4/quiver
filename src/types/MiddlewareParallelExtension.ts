import { MiddlewareParallelInput } from "./MiddlewareParallelInput.js";
import { MiddlewareParallelOutput } from "./MiddlewareParallelOutput.js";

// Parallel functions with overlapping input keys must have compatible types for
// the overlapping keys. The overlapping keys are compatible if one side's type
// extends the other. They are compatible because we can intersect the input
// types to create the total input type. Parallel functions must not have
// overlapping output keys.
//
// See the imported types for implementations of the above rules.

export type MiddlewareParallelExtension<CtxInMw, CtxOutMw, F> = F extends (
  ctx: infer I,
) => infer O
  ? O extends I
    ? MiddlewareParallelInput<CtxInMw, I> extends never
      ? never
      : MiddlewareParallelOutput<CtxOutMw, O> extends never
        ? never
        : F
    : never
  : never;
