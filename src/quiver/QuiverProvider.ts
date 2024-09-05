import { QuiverOptions } from "../types/QuiverOptions.js";
import { Message } from "../types/Message.js";
import { Fig } from "../types/Fig.js";
import { createParseUrl } from "../hooks/createParseUrl.js";
import { createParseJson } from "../hooks/createParseJson.js";
import { createParseRequest } from "../hooks/createParseRequest.js";
import { createValidateInput } from "../hooks/createValidateInput.js";
import { createCallFunction } from "../hooks/createCallFunction.js";
import { createParseResponse } from "../hooks/createParseResponse.js";
import { createValidateOutput } from "../hooks/createValidateOutput.js";
import { createExit } from "../hooks/createExit.js";
import { createReturn } from "../hooks/createReturn.js";
import { createThrow } from "../hooks/createThrow.js";
import { QuiverHandler } from "../types/QuiverHandler.js";
import { createFig } from "./createFig.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverHookName } from "../types/QuiverHookName.js";
import { createRegistry } from "./createRegistry.js";
import { QuiverNamespace } from "../types/QuiverNamespace.js";
import { QuiverSubscription } from "../types/QuiverSubscription.js";
import { QuiverClient } from "./QuiverClient.js";

export class QuiverProvider<M> {
  public fig: Fig;
  public registry = createRegistry();
  private subscription?: QuiverSubscription;
  private options?: QuiverOptions;
  private bound: {
    router?: QuiverRouter<any, any, any>;
    client?: QuiverClient<any, any, any>;
  } = {};

  public constructor(fig: Fig, options?: QuiverOptions) {
    this.fig = fig;
    this.options = options;
  }

  public async create<M>(options?: QuiverOptions) {
    if (options?.signer === undefined) {
      throw new Error(
        "No fig provided, fig is the only supported init option!",
      );
    }

    const fig = await createFig(options);

    return new QuiverProvider<M>(fig, options);
  }

  public async start() {
    await this.fig.start();

    this.subscription = await this.fig.subscribe((received) => {
      this.bound.router?.route(received);
      this.bound.client?.call(received);
    });

    return this.stop;
  }

  public stop() {
    this.fig.stop();

    this.subscription?.unsubscribe();
  }

  public use<Nxt>(handler: QuiverHandler<M, Nxt>) {
    this.registry.USE.push(handler);

    return this as unknown as QuiverProvider<Nxt>;
  }

  public router(router: QuiverRouter<any, any, any>) {
    this.bound.router = router;
  }

  public client(client: QuiverClient<any, any, any>) {
    this.bound.client = client;
  }

  private middleware(hook: QuiverHookName, path: string[]) {
    if (this.bound.router === undefined) {
      throw new Error(`Provider has not been bound!`);
    }

    if (path.length === 0) {
      throw new Error("No path provided");
    }

    const mw = this.registry[hook];

    if (path.length === 0) {
      return mw;
    }

    const next = this.bound.router[path[0] as keyof typeof this.bound.router];

    if (next === undefined) {
      throw new Error(`No scope found for ${path[0]}`);
    }

    const nested: QuiverHandler<any, any>[] = [];

    if (next instanceof QuiverFunction) {
      nested.push(...next.middleware(hook));
    } else if (next instanceof QuiverRouter) {
      nested.push(...next.middleware(hook, path));
    } else {
      throw new Error("Unreachable");
    }

    if (hook === "USE") {
      return [...this.registry.USE, ...nested];
    } else {
      return [...nested, ...this.registry[hook]];
    }
  }

  private compile(path: string[]): QuiverHandler<any, any> {
    if (this.bound.router === undefined) {
      throw new Error(`Provider has not been bound!`);
    }

    if (path.length === 0) {
      throw new Error("Not found");
    }

    const next = this.bound.router[path[0] as keyof typeof this.bound.router];

    if (next === undefined) {
      throw new Error(`No handler found for path ${path[0]}!`);
    }

    if (next instanceof QuiverFunction) {
      return next.compile();
    } else if (next instanceof QuiverRouter) {
      return next.compile(path.slice(1));
    } else {
      throw new Error("Unreachable");
    }
  }
}
