import { Message } from "./Message.js";
import { QuiverPath } from "./QuiverPath.js";
import { QuiverRequest } from "./QuiverRequest.js";
import { QuiverResponse } from "./QuiverResponse.js";

export type QuiverContext = {
  path: QuiverPath;
  continue: boolean;
  message: Message;
  request?: QuiverRequest;
  response?: QuiverResponse<unknown>;
  metadata?: Record<string, unknown>;
};
