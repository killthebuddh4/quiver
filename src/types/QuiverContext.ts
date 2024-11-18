import { Message } from "./Message.js";
import { QuiverUrl } from "./QuiverUrl.js";
import { QuiverRequest } from "./QuiverRequest.js";
import { QuiverErrorResponse } from "./QuiverErrorResponse.js";
import { QuiverSuccessResponse } from "./QuiverSuccessResponse.js";

/* TODO We need to think about unbundling this type into a few different types
 * for a few different situations. See dev notes for 2024-11-18. */

export type QuiverContext = {
  message: Message;
  url: QuiverUrl;
  json: unknown;
  request: QuiverRequest;
  function?: (i: any, ctx: any) => any;
  input?: any;
  throw?: Omit<QuiverErrorResponse, "id" | "ok">;
  return?: Omit<QuiverSuccessResponse<unknown>, "id" | "ok">;
  exit?: unknown;
  sent?: Message;
};
