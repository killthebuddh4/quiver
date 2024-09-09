import { Message } from "../types/Message.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { parseQuiverUrl } from "../parsers/parseQuiverUrl.js";
import { QuiverRouter } from "../types/QuiverRouter.js";
import { getFunction } from "../lib/getFunction.js";
import { parseQuiverRequest } from "../parsers/parseQuiverRequest.js";
import { getMiddleware } from "../lib/getMiddleware.js";

export const createApp =
  <CtxOut extends QuiverContext>(
    use?: (ctx: QuiverContext) => CtxOut,
    exit?: (ctx: QuiverContext) => QuiverContext,
  ) =>
  (router: QuiverRouter<CtxOut, any>) => {
    return (message: Message) => {
      // RECV_MESSAGE

      let ctx: QuiverContext = {
        message,
      };

      // USE

      if (use) {
        ctx = {
          ...ctx,
          ...use(ctx),
        };
      }

      // PARSE_URL

      const url = parseQuiverUrl(ctx.message);

      if (!url.ok) {
        ctx.exit = {
          code: "INVALID_URL",
          reason: `Failed to parse message because ${url.reason}`,
        };

        throw new Error(JSON.stringify(ctx, null, 2));
      }

      ctx.url = url.value;

      // GET_FUNCTION

      if (ctx.url === undefined) {
        throw new Error(JSON.stringify(ctx, null, 2));
      }

      const fn = getFunction(ctx.url.path, router);

      if (!fn.ok) {
        ctx.throw = {
          code: "UNKNOWN_FUNCTION",
        };
      }

      ctx.function = fn.value;

      // PARSE_JSON

      try {
        ctx.json = JSON.parse(String(ctx.message.content));
      } catch (error) {
        ctx.throw = {
          code: "JSON_PARSE_FAILED",
        };
      }

      // PARSE_REQUEST

      if (ctx.json === undefined) {
        throw new Error(JSON.stringify(ctx, null, 2));
      }

      const request = parseQuiverRequest(ctx.json);

      if (!request.ok) {
        ctx.throw = {
          code: "REQUEST_PARSE_FAILED",
        };
      }

      ctx.request = request.value;

      // VALIDATE_INPUT

      if (ctx.request === undefined) {
        throw new Error(JSON.stringify(ctx, null, 2));
      }

      ctx.input = ctx.request.arguments;

      // CALL_FUNCTION

      const middleware = getMiddleware(ctx.url.path, router);

      for (const mw of middleware) {
        ctx = mw(ctx);
      }

      if (ctx.function === undefined) {
        throw new Error(JSON.stringify(ctx, null, 2));
      }

      try {
        ctx.output = ctx.function.fn(ctx.input, ctx);
      } catch (error) {
        ctx.throw = {
          code: "SERVER_ERROR",
        };
      }

      // EXIT

      ctx = exit ? exit(ctx) : ctx;

      // SEND

      if (ctx.throw !== undefined) {
        // send the error
      }

      if (ctx.return !== undefined) {
        // send the return value
      }

      // FINALLY

      // do some stuff

      return ctx;
    };
  };
