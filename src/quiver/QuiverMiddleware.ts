import { QuiverHandler } from "../types/QuiverHandler.js";

export class QuiverMiddleware<I, O> {
  private handlers: QuiverHandler<any, any>[] = [];

  public constructor(handler: QuiverHandler<I, O>) {
    this.handlers.push(handler);
  }

  public use<M>(handler: QuiverHandler<O, M>) {
    this.handlers.push(handler);

    return this as unknown as QuiverMiddleware<I, M>;
  }

  public run: QuiverHandler<I, O> = async (context) => {
    let ctx = context as any;

    for (const h of this.handlers) {
      ctx = await h(ctx);
    }

    return ctx as O;
  };

  public bind() {
    return this.run;
  }
}
