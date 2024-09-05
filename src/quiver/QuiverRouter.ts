import { QuiverHandler } from "../types/QuiverHandler.js";
import { QuiverHookName } from "../types/QuiverHookName.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { createRegistry } from "./createRegistry.js";
import { Message } from "../types/Message.js";
import { createParseJson } from "../hooks/createParseJson.js";
import { createParseRequest } from "../hooks/createParseRequest.js";
import { createValidateInput } from "../hooks/createValidateInput.js";
import { createExit } from "../hooks/createExit.js";
import { createReturn } from "../hooks/createReturn.js";
import { createThrow } from "../hooks/createThrow.js";
import { QuiverProvider } from "./QuiverProvider.js";
import { QuiverRoute } from "../types/QuiverRoute.js";

export class QuiverRouter<I, M, F> {
  public provider?: QuiverProvider<any>;
  public registry = createRegistry();
  private routes?: Record<string, QuiverRoute>;

  public constructor() {}

  public use<Nxt>(handler: QuiverHandler<M, Nxt>) {
    this.registry.USE.push(handler);

    return this as unknown as QuiverRouter<I, Nxt, F>;
  }

  public bind<Nxt>(handlers: {
    [K in keyof Nxt]:
      | QuiverRouter<M, Nxt[K], any>
      | QuiverFunction<M, Nxt[K], any>;
  }) {
    (this.routes as any) = handlers;

    return this as unknown as QuiverRouter<I, M, Nxt>;
  }

  public middleware(hook: QuiverHookName, path: string[]) {
    if (this.routes === undefined) {
      throw new Error(`Scope at path ${path.join("/")} has not been bound!`);
    }

    const mw = this.registry[hook];

    if (path.length === 0) {
      return mw;
    }

    const next = this.routes[path[0]];

    if (next === undefined) {
      throw new Error(`No handler found for path ${path[0]}!`);
    }

    const nested: QuiverHandler<any, any>[] = [];

    if (next instanceof QuiverFunction) {
      nested.push(next.compile());
    } else if (next instanceof QuiverRouter) {
      nested.push(...next.middleware(hook, path.slice(1)));
    } else {
      throw new Error("Unreachable");
    }

    if (hook === "USE") {
      return [...this.registry.USE, ...nested];
    } else {
      return [...nested, ...this.registry[hook]];
    }
  }

  public compile(path: string[]): QuiverHandler<any, any> {
    if (this.routes === undefined) {
      throw new Error(`Scope at path ${path.join("/")} has not been bound!`);
    }

    if (path.length === 0) {
      throw new Error("Not found");
    }

    const next = this.routes[path[0]];

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

  public async route(received: Message) {
    if (this.provider === undefined) {
      throw new Error("Router not bound to provider!");
    }

    if (received.senderAddress === this.provider.fig.address) {
      return;
    }

    let ctx: any = {
      received,
      provider: this.provider,
    };

    let mw: QuiverHandler<any, any>[];

    outer: {
      inner: {
        mw = this.middleware("RECV_MESSAGE", []);

        for (const h of mw) {
          ctx = await h(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break;
        }

        mw = this.middleware("PARSE_URL", []);

        for (const h of mw) {
          ctx = await h(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break;
        }

        mw = this.middleware("PARSE_JSON", ctx.url.path);

        for (const h of mw) {
          ctx = await h(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;
        }

        ctx = await createParseJson()(ctx);

        if (ctx.url?.channel === "requests") {
          return;
        }

        mw = this.middleware("PARSE_REQUEST", ctx.url.path);

        for (const h of mw) {
          ctx = await h(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;
        }

        ctx = await createParseRequest()(ctx);

        mw = this.middleware("VALIDATE_INPUT", ctx.url.path);

        for (const h of mw) {
          ctx = await h(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;
        }

        ctx = await createValidateInput()(ctx);

        mw = this.middleware("CALL_FUNCTION", ctx.url.path);

        for (const h of mw) {
          ctx = await h(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;
        }

        ctx = await this.compile(ctx.url.path)(ctx);

        if (ctx.error) break outer;
        if (ctx.exit || ctx.return || ctx.throw) break inner;

        mw = this.middleware("VALIDATE_OUTPUT", ctx.url.path);

        for (const h of mw) {
          ctx = await h(ctx);

          if (ctx.error) break outer;
          if (ctx.exit || ctx.return || ctx.throw) break inner;
        }
      }

      /* BREAK INNER JUMPS HERE */

      if (ctx.throw) {
        mw = this.middleware("THROW", ctx.url.path);

        for (const h of mw) {
          ctx = await h(ctx);

          if (ctx.error) break outer;
        }

        ctx = await createThrow()(ctx);

        if (ctx.error) break outer;
      }

      if (ctx.exit) {
        mw = this.middleware("EXIT", ctx.url.path);

        for (const h of mw) {
          ctx = await h(ctx);

          if (ctx.error) break outer;
        }

        ctx = await createExit()(ctx);

        if (ctx.error) break outer;
      }

      if (ctx.return) {
        ctx = await createReturn()(ctx);

        if (ctx.error) break outer;
      }
    }

    /* BREAK OUTER JUMPS HERE */

    if (ctx.error) {
      // TODO
    }
  }
}
