import * as Quiver from "../types/quiver/quiver.js";
import { Maybe } from "../types/util/Maybe.js";
import { QuiverApp } from "./QuiverApp.js";

export class QuiverRouter<
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]:
      | Quiver.Function<CtxOut, any, any>
      | Quiver.Router<CtxOut, any, any>;
  },
> implements Quiver.Router<CtxIn, CtxOut, Routes>
{
  public type = "QUIVER_ROUTER" as const;

  public middleware: Quiver.Middleware<CtxIn, CtxOut, any, any>;

  public routes: Routes;

  public constructor(
    middleware: Quiver.Middleware<CtxIn, CtxOut, any, any>,
    routes: Routes,
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

    if (route === undefined) {
      throw new Error(`Route not found ${path[0]}`);
    }

    const next = route.compile(path.slice(1));

    return [this.middleware.compile(), ...next];
  }

  public route(path: string[]): Maybe<(i: any, ctx: any) => any> {
    if (path.length === 0) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
      };
    }

    const route = this.routes[path[0]];

    if (route === undefined) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
      };
    }

    return route.route(path.slice(1));
  }

  public app(
    namespace: string,
  ): CtxIn extends Quiver.Context ? Quiver.App : never {
    return new QuiverApp(namespace, this) as any;
  }
}
