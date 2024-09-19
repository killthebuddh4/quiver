import { Message } from "./Message.js";
import { QuiverUrl } from "./QuiverUrl.js";
import { QuiverResponse } from "./QuiverResponse.js";

export type QuiverClientContext = {
  message: Message;
  url?: QuiverUrl;
  json?: unknown;
  response?: QuiverResponse<unknown>;
  output?: unknown;
};
