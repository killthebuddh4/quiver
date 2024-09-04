import { QuiverOptions } from "../types/QuiverOptions.js";
import { Message } from "../types/Message.js";
import { runHook } from "../lib/runMiddleware.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { Fig } from "../types/Fig.js";
import { Wallet } from "@ethersproject/wallet";
import { createMessage } from "../hooks/createMessage.js";
import { createParseUrl } from "../hooks/creatParseUrl.js";
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

export class Quiver<I, O> {
  private fig: Fig;
  private middleware: QuiverHandler<any, any>[];
  private subscription?: { unsubscribe: () => void };
  private options?: QuiverOptions;
  private routers: { [key: string]: QuiverRouter<any, any, any> };
  private clients: { [key: string]: QuiverRouter<any, any, any> };

  public constructor(fig: Fig, options?: QuiverOptions) {
    this.fig = fig;
    this.middleware = [];
    this.options = options;
    this.routers = {};
    this.clients = {};
  }

  public async create<I, O>(options?: QuiverOptions) {
    if (options?.signer === undefined) {
      throw new Error(
        "No fig provided, fig is the only supported init option!",
      );
    }

    const fig = await createFig(options);

    return new Quiver<I, O>(fig, options);
  }

  public async start() {
    await this.fig.start();

    this.subscription = await this.fig.subscribe(this.handler);

    return this.stop;
  }

  public stop() {
    this.fig.stop();

    this.subscription?.unsubscribe();
  }

  public use<M>(handler: QuiverHandler<O, M>) {
    this.middleware.push(handler);

    return this as unknown as Quiver<I, M>;
  }

  public client() {
    // TODO
  }

  public router(path: string, router: QuiverRouter<any, any, any>) {
    this.routers[path] = router;
  }

  private async handler(received: Message) {
    if (received.senderAddress === this.fig.address) {
      return;
    }

    let ctx: any = {
      received,
      fig: this.fig,
    };

    outer: {
      inner: {
        for (const h of this.middleware) {
          ctx = await h(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;
        }

        ctx = await createMessage()(ctx);

        if (ctx.error) break outer;
        if (ctx.exit || ctx.return || ctx.throw) break inner;

        ctx = await createParseJson()(ctx);

        if (ctx.error) break outer;
        if (ctx.exit || ctx.return || ctx.throw) break inner;

        ctx = await createParseUrl()(ctx);

        if (ctx.url?.channel === "requests") {
          ctx = await createParseRequest()(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;

          ctx.router = this.routers[ctx.url.path.namespace];

          if (ctx.router === undefined) {
            ctx.throw = {
              code: 404,
              message: "TODO",
            };
          }

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;

          ctx.route = ctx.router.routes[ctx.url.path.function];

          if (ctx.route === undefined) {
            ctx.throw = {
              code: 404,
              message: "TODO",
            };
          }

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;

          ctx = await createValidateInput()(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;

          ctx = await createCallFunction()(ctx);
        }

        if (ctx.url?.channel === "responses") {
          ctx = await createParseResponse()(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;

          ctx = await createGetClient()(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;

          ctx = await createGetClient()(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;

          ctx = await createValidateOutput()(ctx);
        }
      }

      /* BREAK INNER JUMPS HERE */

      if (ctx.exit) {
        ctx = await createExit()(ctx);
      }

      if (ctx.return) {
        ctx = await createReturn()(ctx);
      }

      if (ctx.throw) {
        ctx = await createThrow()(ctx);
      }
    }

    /* BREAK OUTER JUMPS HERE */

    if (ctx.error) {
      // TODO
    }
  }
}
