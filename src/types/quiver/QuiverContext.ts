import { Message } from "../Message.js";
import { QuiverUrl } from "../QuiverUrl.js";
import { QuiverRequest } from "../QuiverRequest.js";
import { QuiverError } from "../QuiverError.js";
import { QuiverSuccess } from "../QuiverSuccess.js";

export type QuiverContext<CtxIn, I, O> = {
  received: Message;
  url: QuiverUrl;
  json: unknown;
  request: QuiverRequest;
  function?: (i: I, ctx: CtxIn) => O;
  input?: I;
  output?: O;
  throw?: Omit<QuiverError, "id" | "ok">;
  return?: Omit<QuiverSuccess<O>, "id" | "ok">;
  exit?: unknown;
  sent?: Message;
};
