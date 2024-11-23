import { QuiverRouter } from "../QuiverRouter.js";
import { PipeableCtx } from "../middleware/PipeableCtx.js";
import { ResultCtx } from "../middleware/ResultCtx.js";

/* Returns Route if Route can be routed to by Router, otherwise never. */

export type RouteableFunction<Router, Route> =
  Router extends QuiverRouter<infer RouterCtxIn, infer RouterCtxOut, any>
    ? Route extends (...args: infer Args) => any
      ? PipeableCtx<ResultCtx<RouterCtxIn, RouterCtxOut>, Args[1]> extends 1
        ? Route
        : never
      : never
    : never;
