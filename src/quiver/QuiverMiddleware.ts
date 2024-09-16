import { ParallelExtension } from "../types/util/ParallelExtension.js";
import { SerialExtension } from "../types/util/SerialExtension.js";
import { Resolve } from "../types/util/Resolve.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverRouter } from "./QuiverRouter.js";
import * as Quiver from "../types/quiver/quiver.js";

export class QuiverMiddleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>
  implements Quiver.Middleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut>
{
  private handlers: Array<Array<(ctx: any) => any>> = [];

  public constructor(handlers: Array<Array<(ctx: any) => any>>) {
    this.handlers = handlers;
  }

  public extend<F>(fn: ParallelExtension<CtxIn, CtxOut, F>) {
    if (this.handlers.length === 0) {
      throw new Error("Middleware instance should never have empty handlers");
    }

    const next = this.handlers.map((stage) => stage.map((handler) => handler));

    next[next.length - 1].push(fn);

    return new QuiverMiddleware<
      Resolve<F extends (ctx: infer I) => any ? I & CtxIn : never>,
      Resolve<F extends (ctx: any) => infer O ? O & CtxOut : never>,
      CtxExitIn,
      CtxExitOut
    >(next);
  }

  public pipe<F>(fn: SerialExtension<CtxOut, F>) {
    if (this.handlers.length === 0) {
      throw new Error("Middleware instance should never have empty handlers");
    }

    const next = this.handlers.map((stage) => stage.map((handler) => handler));

    next.push([fn]);

    return new QuiverMiddleware<
      Resolve<
        F extends (ctx: infer I) => any ? Omit<I, keyof CtxIn> & CtxIn : never
      >,
      Resolve<F extends (ctx: any) => infer O ? O & CtxOut : never>,
      CtxExitIn,
      CtxExitOut
    >(next);
  }

  public compile() {
    return this.handlers;
  }

  public exec(ctx: CtxIn): CtxOut {
    let final: any = ctx;

    for (const stage of this.handlers) {
      let intermediate: any = final;

      for (const handler of stage) {
        intermediate = handler(final);
      }

      final = intermediate;
    }

    return final;
  }

  public function<Exec extends (...args: any[]) => any>(
    fn: Exec,
  ): Quiver.Function<CtxIn, CtxOut, Exec> {
    return new QuiverFunction<CtxIn, CtxOut, Exec>(this, fn);
  }

  public router<
    Routes extends {
      [key: string]:
        | Quiver.Function<CtxOut, any, any>
        | Quiver.Router<CtxOut, any, any>;
    },
  >(routes: Routes): Quiver.Router<CtxIn, CtxOut, Routes> {
    return new QuiverRouter(this, routes);
  }
}
