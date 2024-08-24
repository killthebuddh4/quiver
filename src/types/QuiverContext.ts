import { Message } from "./Message.js";
import { QuiverReturn } from "./QuiverReturn.js";
import { QuiverThrow } from "./QuiverThrow.js";

export type QuiverContext = {
  return: QuiverReturn;
  throw: QuiverThrow;
  message: Message;
  metadata?: Record<string, unknown>;
};
