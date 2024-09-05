import { createRegistry } from "./createRegistry.js";
import { QuiverHandler } from "../types/QuiverHandler.js";
import { QuiverHookName } from "../types/QuiverHookName.js";

export class QuiverFunction<I, M, O> {
  public handler?: QuiverHandler<any, any>;

  public registry = createRegistry();

  public constructor() {}

  public bind<Nxt>(handler: QuiverHandler<M, Nxt>) {
    this.handler = handler;

    return this as unknown as QuiverFunction<I, M, Nxt>;
  }

  public use<Nxt>(handler: QuiverHandler<M, Nxt>) {
    this.registry.USE.push(handler);

    return this as unknown as QuiverFunction<I, Nxt, O>;
  }

  public return<Nxt>(handler: QuiverHandler<O, Nxt>) {
    this.registry.RETURN.push(handler);

    return this as unknown as QuiverFunction<I, M, Nxt>;
  }

  public throw(handler: QuiverHandler<M, any>) {
    this.registry.THROW.push(handler);

    return this;
  }

  public exit(handler: QuiverHandler<M, any>) {
    this.registry.EXIT.push(handler);

    return this;
  }

  public middleware(hook: QuiverHookName) {
    return this.registry[hook];
  }

  public compile() {
    if (this.handler === undefined) {
      throw new Error("No handler bound!");
    }

    return this.handler;
  }
}
