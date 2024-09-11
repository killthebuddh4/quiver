import { QuiverRouter } from "../types/QuiverRouter.js";
import { createFunction } from "./createFunction.js";

export class Quiver<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {
  private handlers: {
    use: Array<(ctx: any) => any>;
    exit: Array<(ctx: any) => any>;
  } = { use: [], exit: [] };

  public constructor() {}

  public use<
    I extends CtxIn extends undefined
      ? unknown
      : CtxOut extends undefined
        ? CtxIn // just in defined
        : CtxOut, // both defined
    O extends I,
  >(fn: (ctx: I) => O) {
    this.handlers.use.push(fn);

    return this as unknown as Quiver<
      CtxIn extends undefined ? I : CtxIn,
      O,
      CtxExitIn,
      CtxExitOut
    >;
  }

  public exit<
    I extends CtxExitIn extends undefined
      ? unknown
      : CtxExitOut extends undefined
        ? CtxExitIn // just in defined
        : CtxExitOut, // both defined
    O extends I,
  >(fn: (ctx: I) => O) {
    this.handlers.exit.push(fn);

    return this as unknown as Quiver<
      CtxIn,
      CtxOut,
      CtxExitIn extends undefined ? I : CtxExitIn,
      O
    >;
  }

  public middleware() {
    return {
      use: (context: CtxIn) => {
        let ctx = context;

        for (const fn of this.handlers.use) {
          ctx = fn(ctx);
        }

        return ctx as unknown as CtxOut;
      },
      exit: (context: CtxExitIn) => {
        let ctx = context;

        for (const fn of this.handlers.exit) {
          ctx = fn(ctx);
        }

        return ctx as unknown as CtxExitOut;
      },
    };
  } 

  public router<R extends QuiverRouter<CtxOut, any, any, any>["routes"]>(
    routes: R,
  ): QuiverRouter<CtxIn, CtxOut, CtxExitIn, CtxExitOut> {

    return {
      middleware: this.middleware(),
      routes,
    };
  }
}

const quiver = () => new Quiver();

const nothing = quiver().middleware();

const authenticated = quiver().use(() => ({ user: 'test-user-1' })).middleware();

const app = quiver()
  .use((ctx: { user: string }) => ctx)
  .use((ctx) => ({ ...ctx, hello: "world" }));
  .router({
    greet: 

