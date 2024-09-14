import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverNode } from "../types/QuiverNode.js";
import { NewKey } from "../types/util/NewKey.js";
import { Resolve } from "../types/util/Resolve.js";
import { QuiverProvider } from "./QuiverProvider.js";

type QuiverRouterState<CtxIn, CtxOut, R> = {
  provider?: QuiverProvider<CtxIn>;
  middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;
  routes: R;
};

// TODO Move away from classes. I just want a store and type-safe access to it.

interface QuiverRouterApi<CtxIn, CtxOut, R> {
  typeguard(ctx: CtxIn): never;
  compile(path?: string[]): Array<(ctx: CtxIn) => CtxOut>;
  exec(path?: string[]): any;
  route: <N extends { [key in NewKey<R, string>]: QuiverNode<CtxOut> }>(
    n: N,
  ) => QuiverRouterApi<CtxIn, CtxOut, Resolve<R & N>>;
}

export class QuiverRouter<
  CtxIn,
  CtxOut,
  R extends {
    [key: string]: QuiverNode<CtxOut>;
  },
> implements QuiverRouterApi<CtxIn, CtxOut, R>
{
  private state: QuiverRouterState<CtxIn, CtxOut, R>;

  public constructor(state: QuiverRouterState<CtxIn, CtxOut, R>) {
    this.state = state;
  }

  public typeguard(ctx: CtxIn): never {
    throw new Error(`This function should never be called ${ctx}`);
  }

  public compile(path?: string[]) {
    if (path === undefined) {
      throw new Error("Path is undefined");
    }

    if (path.length === 0) {
      throw new Error("Path is empty");
    }

    const route = this.state.routes[path[0]];

    const next = route.compile(path.slice(1));

    return [this.state.middleware.compile(), ...next];
  }

  public exec(path?: string[]) {
    if (path === undefined) {
      throw new Error("Path is undefined");
    }

    if (path.length === 0) {
      throw new Error("Path is empty");
    }

    const route = this.state.routes[path[0]];

    return route.exec(path.slice(1));
  }

  public route<N extends { [key in NewKey<R, string>]: QuiverNode<CtxOut> }>(
    n: N,
  ) {
    return new QuiverRouter<CtxIn, CtxOut, Resolve<R & N>>({
      provider: this.state.provider,
      middleware: this.state.middleware,
      routes: {
        ...this.state.routes,
        ...n,
      } as Resolve<R & N>,
    });
  }
}
