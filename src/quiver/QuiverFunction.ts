import { QuiverPipeline } from "../types/QuiverPipeline.js";
import * as Quiver from "../types/quiver/quiver.js";
import { Message } from "../types/Message.js";
import { parseQuiverUrl } from "../parsers/parseQuiverUrl.js";
import { parseQuiverRequest } from "../parsers/parseQuiverRequest.js";
import { QuiverError } from "../types/QuiverError.js";

export class QuiverFunction<CtxIn, CtxOut, Exec extends (...args: any[]) => any>
  implements Quiver.Function<CtxIn, CtxOut, Exec>
{
  public type = "QUIVER_FUNCTION" as const;

  public middleware: Quiver.Middleware<CtxIn, CtxOut, any, any>;

  public exec: Exec;

  private provider?: Quiver.Provider;

  private namespace?: string;

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

  public async start(
    namespace: string,
    provider?: CtxIn extends Quiver.Context<any, any, any>
      ? Quiver.Provider | undefined
      : never,
  ) {
    if (provider === undefined) {
      throw new Error("Default provider not yet implemented");
    }

    this.namespace = namespace;

    this.provider = provider;

    const unsub = await provider.subscribe(this.handler);

    return {
      stop: unsub.unsubscribe,
    };
  }

  public route() {
    return this.exec;
  }

  // NOTE This handler is only used when the function itself is used as the root route.
  // Otherwise, the handler in the router is used. This isn't great but fine for now, we
  // just need to keep remember to maintain parity between the two.
  private async handler(message: Message) {
    if (this.provider === undefined) {
      throw new Error("Provider is undefined");
    }

    if (this.namespace === undefined) {
      throw new Error("Namespace is undefined");
    }

    console.log(
      `FUNCTION @${this.provider.signer.address} RECEIVED MESSAGE from ${message.senderAddress}\n`,
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

    /* ************************************************************************
     *
     * NAMESPACE
     *
     * ***********************************************************************/

    if (received.url.path[0] !== this.namespace) {
      throw new Error(`Namespace mismatch`);
    }

    console.log(`ROUTER @${this.provider.signer.address} MATCHED NAMESPACE`);

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

    /* ************************************************************************
     *
     * GET_FUNCTION
     *
     * ***********************************************************************/

    let ctx: Quiver.Context<any, Parameters<Exec>[0], ReturnType<Exec>> = {
      received: received.message,
      url: received.url,
      json: received.json,
      request: received.request,
      function: this.exec,
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

    const middlewares = this.compile();

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
