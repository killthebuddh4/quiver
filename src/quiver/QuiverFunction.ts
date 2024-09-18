import { QuiverPipeline } from "../types/QuiverPipeline.js";
import * as Quiver from "../types/quiver/quiver.js";
import { Maybe } from "../types/util/Maybe.js";
import { QuiverApp } from "./QuiverApp.js";

export class QuiverFunction<CtxIn, CtxOut, Exec extends (...args: any[]) => any>
  implements Quiver.Function<CtxIn, CtxOut, Exec>
{
  public type = "QUIVER_FUNCTION" as const;

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

  public compile(path?: string[]): QuiverPipeline[] {
    if (path !== undefined && path.length > 0) {
      throw new Error("QuiverFunction.compile() does not take any arguments");
    }

    return [this.middleware.compile()];
  }

  public route(path?: string[]): Maybe<(i: any, ctx: any) => any> {
    if (path !== undefined && path.length > 0) {
      return {
        ok: false,
        code: "FUNCTION_NOT_FOUND",
      };
    }

    return {
      ok: true,
      value: this.exec,
    };
  }

  public app(
    namespace: string,
  ): CtxIn extends Quiver.Context ? Quiver.App : never {
    return new QuiverApp(namespace, this) as any;
  }
}
