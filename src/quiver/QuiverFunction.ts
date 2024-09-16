import { QuiverPipeline } from "../types/QuiverPipeline.js";
import { QuiverApp } from "./QuiverApp.js";
import * as Quiver from "../types/quiver/quiver.js";

export class QuiverFunction<CtxIn, CtxOut, Exec extends (...args: any[]) => any>
  implements Quiver.Function<CtxIn, CtxOut, Exec>
{
  public middleware: Quiver.Middleware<CtxIn, CtxOut, any, any>;

  public exec: Exec;

  public constructor(
    middleware: Quiver.Middleware<CtxIn, CtxOut, any, any>,
    exec: Exec,
  ) {
    this.middleware = middleware;
    this.exec = exec;
  }

  public typeguard(ctx: CtxIn): never {
    throw new Error(`This function should never be called ${ctx}`);
  }

  public compile(): QuiverPipeline[] {
    return [this.middleware.compile()];
  }

  public app(): CtxIn extends Quiver.Context ? Quiver.App<typeof this> : never {
    return new QuiverApp(this) as CtxIn extends Quiver.Context
      ? Quiver.App<typeof this>
      : never;
  }
}
