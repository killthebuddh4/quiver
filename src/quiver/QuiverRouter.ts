import { QuiverMiddleware } from "./QuiverMiddleware.js";

export class QuiverRouter<CtxIn, CtxOut, R> {
  private middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;
  private routes: R;

  public constructor(
    middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>,
    routes: R,
  ) {
    this.middleware = middleware;
    this.routes = routes;
  }
}
