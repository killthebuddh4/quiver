import { QuiverHandler } from "../types/QuiverHandler.js";

export class QuiverMiddleware<I, O> {
  private handlers: QuiverHandler<any, any>[] = [];

  public constructor(handler: QuiverHandler<I, O>) {
    this.handlers.push(handler);
  }

  public use<Nxt>(handler: QuiverHandler<O, Nxt>) {
    this.handlers.push(handler);

    return this as unknown as QuiverMiddleware<I, Nxt>;
  }
}
