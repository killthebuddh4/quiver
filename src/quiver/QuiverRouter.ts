import { Maybe } from "../types/util/Maybe.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";

export class QuiverRouter<
  CtxIn,
  CtxOut,
  R extends {
    [key: string]: {
      compile: (path?: string[]) => Array<(ctx: CtxOut) => any>;
      exec: (path?: string[]) => Maybe<(i: any, ctx: any) => any>;
    };
  },
> {
  public middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>;
  public routes: R;

  public constructor(
    middleware: QuiverMiddleware<CtxIn, CtxOut, any, any>,
    routes: R,
  ) {
    this.middleware = middleware;
    this.routes = routes;
  }

  public compile(path?: string[]) {
    if (path === undefined) {
      throw new Error("Path is undefined");
    }

    if (path.length === 0) {
      throw new Error("Path is empty");
    }

    const route = this.routes[path[0]];

    const next = route.compile(path.slice(1));

    return [this.middleware.compile(), ...next];
  }

  public exec(path?: string[]) {
    if (path === undefined) {
      throw new Error("Path is undefined");
    }

    if (path.length === 0) {
      throw new Error("Path is empty");
    }

    const route = this.routes[path[0]];

    return route.exec(path.slice(1));
  }
}
