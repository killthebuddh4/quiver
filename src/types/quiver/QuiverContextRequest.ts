import { Message } from "../Message.js";
import { QuiverUrl } from "../QuiverUrl.js";
import { QuiverRequest } from "../QuiverRequest.js";
import { QuiverError } from "../QuiverError.js";

export type QuiverContextRequest = {
  message: Message;
  url?: QuiverUrl;
  json?: unknown;
  request?: QuiverRequest;
  throw?: Omit<QuiverError, "id" | "ok">;
  exit?: unknown;
  sent?: Message;
};
