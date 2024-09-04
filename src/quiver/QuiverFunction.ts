import { QuiverHandler } from "../types/QuiverHandler.js";

export class QuiverFunction<I, O> {
  private middleware: QuiverHandler<any, any>[] = [];
  private handler: QuiverHandler<any, any> | null = null;

  public constructor() {}

  public use<M>(handler: QuiverHandler<O, M>) {
    if (this.handler !== null) {
      throw new Error("Function has already been bound!");
    }

    this.middleware.push(handler);

    return this as unknown as QuiverFunction<I, M>;
  }

  public bind<M>(handler: QuiverHandler<O, M>) {
    if (this.handler !== null) {
      throw new Error("Function has already been bound!");
    }

    this.handler = handler;

    return this as unknown as QuiverFunction<I, M>;
  }

  public run: QuiverHandler<I, O> = async (context) => {
    if (this.handler === null) {
      throw new Error("Function has not been bound yet!");
    }

    let ctx = context as any;

    for (const mw of this.middleware) {
      ctx = await mw(ctx);
    }

    ctx = await this.handler(ctx);

    return ctx as O;
  };
}
