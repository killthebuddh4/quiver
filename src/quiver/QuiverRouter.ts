import * as Quiver from "../types/quiver/quiver.js";
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

    const next = route.compile(path.slice(1));

    return [this.middleware.compile(), ...next];
  }

  public app(): CtxIn extends Quiver.Context ? Quiver.App<typeof this> : never {
    return new QuiverApp(this) as CtxIn extends Quiver.Context
      ? Quiver.App<typeof this>
      : never;
  }
}
