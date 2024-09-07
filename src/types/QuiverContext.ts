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
  function?: QuiverFunction<any>;
  request?: QuiverRequest;
  input?: any;
  data?: any;
  output?: any;
  throw?: Omit<QuiverError, "id" | "ok">;
  return?: Omit<QuiverSuccess<unknown>, "id" | "ok">;
  exit?: unknown;
  sent?: Message;
};
