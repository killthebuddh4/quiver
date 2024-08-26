import { Message } from "./Message.js";
import { QuiverReturn } from "./QuiverReturn.js";
import { QuiverThrow } from "./QuiverThrow.js";
import { QuiverRequest } from "./QuiverRequest.js";

export type QuiverContext = {
  return: QuiverReturn;
  throw: QuiverThrow;
  message: Message;
  request: QuiverRequest;
  metadata?: Record<string, unknown>;
};
