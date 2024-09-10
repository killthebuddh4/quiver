import { Message } from "./Message.js";
import { QuiverUrl } from "./QuiverUrl.js";
import { QuiverRequest } from "./QuiverRequest.js";
import { QuiverError } from "./QuiverError.js";
import { QuiverSuccess } from "./QuiverSuccess.js";
import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverContext = {
  message: Message;
  url?: QuiverUrl;
  json?: unknown;
  request?: QuiverRequest;
  function?: QuiverFunction<any, any, any, any>;
  input?: any;
  output?: any;
  throw?: Omit<QuiverError, "id" | "ok">;
  return?: Omit<QuiverSuccess<unknown>, "id" | "ok">;
  exit?: unknown;
  sent?: Message;
};
