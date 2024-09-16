import * as Quiver from "../types/quiver/quiver.js";

export class QuiverApp<
  S extends Quiver.Function<any, any, any> | Quiver.Router<any, any, any>,
> implements Quiver.App<S>
{
  public server: S;

  public provider?: Quiver.Provider;

  public constructor(server: S, provider?: Quiver.Provider) {
    this.server = server;
    this.provider = provider;
  }

  public async start() {
    return () => {};
  }

  public stop() {}
}

// private handler(message: Message) {
//   // RECV_MESSAGE

//   let ctx: QuiverContext = {
//     message,
//   };

//   // PARSE_URL

//   const url = parseQuiverUrl(ctx.message);

//   if (!url.ok) {
//     ctx.exit = {
//       code: "INVALID_URL",
//       reason: `Failed to parse message because ${url.reason}`,
//     };

//     throw new Error(JSON.stringify(ctx, null, 2));
//   }

//   ctx.url = url.value;

//   // GET_FUNCTION

//   if (ctx.url === undefined) {
//     throw new Error(JSON.stringify(ctx, null, 2));
//   }

//   const fn = this.root.exec();

//   if (!fn.ok) {
//     ctx.throw = {
//       code: "UNKNOWN_FUNCTION",
//     };
//   }

//   ctx.function = fn.value;

//   // PARSE_JSON

//   try {
//     ctx.json = JSON.parse(String(ctx.message.content));
//   } catch (error) {
//     ctx.throw = {
//       code: "JSON_PARSE_FAILED",
//     };
//   }

//   // PARSE_REQUEST

//   if (ctx.json === undefined) {
//     throw new Error(JSON.stringify(ctx, null, 2));
//   }

//   const request = parseQuiverRequest(ctx.json);

//   if (!request.ok) {
//     ctx.throw = {
//       code: "REQUEST_PARSE_FAILED",
//     };
//   }

//   ctx.request = request.value;

//   // VALIDATE_INPUT

//   if (ctx.request === undefined) {
//     throw new Error(JSON.stringify(ctx, null, 2));
//   }

//   ctx.input = ctx.request.arguments;

//   // MIDDLEWARE

//   const middleware = this.root.compile(ctx.url.path);

//   for (const mw of middleware) {
//     ctx = mw(ctx);
//   }

//   // CALL_FUNCTION

//   if (ctx.function === undefined) {
//     throw new Error(JSON.stringify(ctx, null, 2));
//   }

//   try {
//     ctx.output = ctx.function(ctx.input, ctx);
//   } catch (error) {
//     ctx.throw = {
//       code: "SERVER_ERROR",
//     };
//   }

//   // EXIT

//   // SEND

//   if (ctx.throw !== undefined) {
//     // send the error
//   }

//   if (ctx.return !== undefined) {
//     // send the return value
//   }

//   // FINALLY

//   // do some stuff

//   return ctx;
// }
