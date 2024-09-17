import * as Quiver from "../types/quiver/quiver.js";
import { Message } from "../types/Message.js";
import { parseQuiverUrl } from "../parsers/parseQuiverUrl.js";
import { parseQuiverRequest } from "../parsers/parseQuiverRequest.js";
import { Maybe } from "../types/util/Maybe.js";
import { QuiverError } from "../types/QuiverError.js";

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

  private provider?: Quiver.Provider;

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

  public async start(
    provider?: CtxIn extends Quiver.Context<any, any, any>
      ? Quiver.Provider | undefined
      : never,
  ) {
    if (provider === undefined) {
      throw new Error("Default provider not yet implemented");
    }

    this.provider = provider;

    console.log(`ROUTER CALLING SUBSCRIBE`);

    const unsub = await provider.subscribe(this.handler.bind(this));

    return {
      stop: unsub.unsubscribe,
    };
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

    if (route.type === "QUIVER_FUNCTION") {
      if (path.length !== 1) {
        return {
          ok: false,
          code: "FUNCTION_NOT_FOUND",
        };
      }

      return {
        ok: true,
        value: route.route(),
      };
    } else {
      return route.route(path.slice(1));
    }
  }

  private async handler(message: Message) {
    console.log(`Handler called`);
    console.log(
      `ROUTER @${this.provider?.signer.address} RECEIVED MESSAGE from ${message.senderAddress}\n`,
      `${message.content}`,
    );

    if (this.provider === undefined) {
      throw new Error("Provider is undefined");
    }

    console.log(
      `ROUTER @${this.provider.signer.address} RECEIVED MESSAGE from ${message.senderAddress}\n`,
      `${message.content}`,
    );

    /* ************************************************************************
     *
     * RECV_MESSAGE
     *
     * ***********************************************************************/

    let received: Quiver.Request = {
      message,
    };

    console.log(`ROUTER @${this.provider.signer.address} RECEIVED MESSAGE`);

    /* ************************************************************************
     *
     * PARSE_URL
     *
     * ***********************************************************************/

    const url = parseQuiverUrl(received.message);

    if (!url.ok) {
      received.exit = {
        code: "INVALID_URL",
        reason: `Failed to parse message because ${url.reason}`,
      };
    }

    received.url = url.value;

    if (received.url === undefined) {
      throw new Error(JSON.stringify(received, null, 2));
    }

    console.log(`ROUTER @${this.provider.signer.address} PARSED URL`);

    /* ************************************************************************
     *
     * PARSE_JSON
     *
     * ***********************************************************************/

    try {
      received.json = JSON.parse(String(received.message.content));
    } catch (error) {
      received.throw = {
        code: "JSON_PARSE_FAILED",
      };
    }

    if (received.json === undefined) {
      throw new Error(JSON.stringify(received, null, 2));
    }

    console.log(`ROUTER @${this.provider.signer.address} PARSED JSON`);

    /* ************************************************************************
     *
     * PARSE_REQUEST
     *
     * ************************************************************************/

    const request = parseQuiverRequest(received.json);

    if (!request.ok) {
      received.throw = {
        code: "REQUEST_PARSE_FAILED",
      };
    }

    received.request = request.value;

    if (received.request === undefined) {
      throw new Error(JSON.stringify(received, null, 2));
    }

    console.log(`ROUTER @${this.provider.signer.address} PARSED REQUEST`);

    /* ************************************************************************
     *
     * GET_FUNCTION
     *
     * ***********************************************************************/

    const fn = this.route(received.url.path);

    if (!fn.ok) {
      received.throw = {
        code: "UNKNOWN_FUNCTION",
      };
    }

    if (fn.value === undefined) {
      throw new Error(JSON.stringify(received, null, 2));
    }

    let ctx: Quiver.Context<
      any,
      Parameters<typeof fn.value>[0],
      ReturnType<typeof fn.value>
    > = {
      received: received.message,
      url: received.url,
      json: received.json,
      request: received.request,
      function: fn.value,
    };

    /* ************************************************************************
     *
     * VALIDATE INPUT
     *
     * ***********************************************************************/

    ctx.input = ctx.request.arguments;

    /* ************************************************************************
     *
     * MIDDLEWARE
     *
     * ***********************************************************************/

    const middlewares = this.compile(ctx.url.path);

    for (const middleware of middlewares) {
      for (const stage of middleware) {
        let stageCtxIn: any = ctx;
        let stageCtxOut: any = ctx;

        for (const handler of stage) {
          stageCtxOut = handler(stageCtxIn);
        }

        ctx = stageCtxOut;
      }
    }

    /* ************************************************************************
     *
     * CALL_FUNCTION
     *
     * ***********************************************************************/

    if (ctx.function === undefined) {
      throw new Error(JSON.stringify(ctx, null, 2));
    }

    try {
      ctx.output = ctx.function(ctx.input, ctx);
    } catch (error) {
      ctx.throw = {
        code: "SERVER_ERROR",
      };
    }

    /* ************************************************************************
     *
     * EXIT
     *
     * ***********************************************************************/

    if (ctx.exit !== undefined) {
      // do some stuff
    }

    /* ************************************************************************
     *
     * THROW
     *
     * ***********************************************************************/

    if (ctx.throw !== undefined) {
      const err: QuiverError = {
        id: ctx.received.id,
        ok: false,
        ...ctx.throw,
      };

      let content;
      try {
        content = JSON.stringify(err);
      } catch (error) {
        throw new Error(`Failed to stringify throw`);
      }

      if (ctx.url === undefined) {
        throw new Error(`Path not found in context`);
      }

      // TODO, how do we handle root (no path) urls?
      const conversationId = `${ctx.url.quiver}/${ctx.url.version}/responses/${this.provider.signer.address}/${ctx.url.path.join("/")}`;

      const sent = await this.provider.publish({
        conversation: {
          peerAddress: ctx.received.conversation.peerAddress,
          context: {
            conversationId,
            metadata: {},
          },
        },
        content,
      });

      ctx.sent = sent;
    }

    /* ************************************************************************
     *
     * RETURN
     *
     * ***********************************************************************/

    if (ctx.return !== undefined) {
      // send the return value

      const response = {
        id: ctx.received.id,
        ok: true,
        ...ctx.return,
      };

      let content;
      try {
        content = JSON.stringify(response);
      } catch (error) {
        throw new Error(`Failed to stringify ctx.return`);
      }

      if (ctx.url === undefined) {
        throw new Error(`Path not found in context`);
      }

      const conversationId = `${ctx.url.quiver}/${ctx.url.version}/responses/${this.provider.signer.address}/${ctx.url.path.join("/")}`;

      const sent = await this.provider.publish({
        conversation: {
          peerAddress: ctx.received.conversation.peerAddress,
          context: {
            conversationId,
            metadata: {},
          },
        },
        content,
      });

      ctx.sent = sent;
    }

    /* ************************************************************************
     *
     * FINALLY
     *
     * ***********************************************************************/
  }
}
