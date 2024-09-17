import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverPipeline } from "../QuiverPipeline.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverProvider } from "./QuiverProvider.js";
import { QuiverContext } from "./QuiverContext.js";
import { Maybe } from "../util/Maybe.js";

export interface QuiverRouter<
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]:
      | QuiverFunction<CtxOut, any, any>
      | QuiverRouter<CtxOut, any, any>;
  },
> {
  type: "QUIVER_ROUTER";

  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;

  routes: Routes;

  route: (path: string[]) => Maybe<(i: any, ctx: any) => any>;

  compile: (path?: string[]) => QuiverPipeline[];

  start: (
    provider?: CtxIn extends QuiverContext<any, any, any>
      ? QuiverProvider | undefined
      : never,
  ) => Promise<{ stop: () => void }>;
}
