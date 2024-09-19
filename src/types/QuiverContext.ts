import { Message } from "./Message.js";
import { QuiverUrl } from "./QuiverUrl.js";
import { QuiverRequest } from "./QuiverRequest.js";
import { QuiverErrorResponse } from "./QuiverErrorResponse.js";
import { QuiverSuccessResponse } from "./QuiverSuccessResponse.js";

export type QuiverContext = {
  message: Message;
  url?: QuiverUrl;
  json?: unknown;
  request?: QuiverRequest;
  function?: (i: any, ctx: any) => any;
  input?: any;
  throw?: Omit<QuiverErrorResponse, "id" | "ok">;
  return?: Omit<QuiverSuccessResponse<unknown>, "id" | "ok">;
  exit?: unknown;
  sent?: Message;
};
