import { QuiverHandler } from "../types/QuiverHandler.js";

export class QuiverRouter<I, O, R> {
  private middleware: QuiverHandler<any, any>[] = [];
  public routes?: any;

  public constructor(middleware: QuiverHandler<I, O>) {
    this.middleware.push(middleware);
  }

  public use<N>(handler: QuiverHandler<O, N>) {
    if (this.routes !== undefined) {
      throw new Error("Router has already been bound!");
    }

    this.middleware.push(handler);

    return this as unknown as QuiverRouter<I, N, R>;
  }

  public bind<F>(routes: {
    [K in keyof F]: QuiverHandler<O, F[K]>;
  }) {
    this.routes = routes;

    return this as unknown as QuiverRouter<I, O, F>;
  }
}
