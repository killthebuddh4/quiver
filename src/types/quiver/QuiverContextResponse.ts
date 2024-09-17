import { Message } from "../Message.js";
import { QuiverUrl } from "../QuiverUrl.js";
import { QuiverResponse } from "../QuiverResponse.js";

export type QuiverContextResponse = {
  message: Message;
  url?: QuiverUrl;
  json?: unknown;
  response?: QuiverResponse<unknown>;
  output?: unknown;
};
