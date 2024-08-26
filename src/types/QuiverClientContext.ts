import { Message } from "./Message.js";
import { QuiverResponse } from "./QuiverResponse.js";

export type QuiverClientContext = {
  message: Message;
  response: QuiverResponse<unknown>;
  metadata?: Record<string, unknown>;
};
