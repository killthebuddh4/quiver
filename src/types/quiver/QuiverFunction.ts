import { QuiverPipeline } from "../QuiverPipeline.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverProvider } from "./QuiverProvider.js";
import { QuiverContext } from "./QuiverContext.js";

export interface QuiverFunction<
  CtxIn,
  CtxOut,
  Exec extends (...args: any[]) => any,
> {
  type: "QUIVER_FUNCTION";

  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  route: () => (i: any, ctx: any) => any;

  compile: () => QuiverPipeline[];

  exec: Exec;

  start: (
    namespace: string,
    provider?: CtxIn extends QuiverContext ? QuiverProvider | undefined : never,
  ) => Promise<{ stop: () => void }>;
}
