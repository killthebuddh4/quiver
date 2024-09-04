import { QuiverHandler } from "../types/QuiverHandler.js";

export class QuiverRouter<I, O, R> {
  private middleware: QuiverHandler<any, any>[] = [];

  public routes?: {
    [K in keyof R]: QuiverHandler<O, R[K]>;
  };

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
    (this.routes as any) = routes;

    return this as unknown as QuiverRouter<I, O, F>;
  }

  public run: QuiverHandler<any, any> = async (context) => {
    if (this.routes === undefined) {
      throw new Error("Router has not been bound!");
    }

    const route = this.routes[context.url.path as keyof typeof this.routes];

    if (route === undefined) {
      context.throw = {
        status: "NOT_FOUND",
        reason: `No route found for path ${context.url.path}`,
      };

      return context;
    }

    return route(context);
  };
}
