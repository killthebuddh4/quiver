import { Message } from "./Message.js";
import { QuiverUrl } from "./QuiverUrl.js";
import { QuiverRequest } from "./QuiverRequest.js";
import { QuiverResponse } from "./QuiverResponse.js";
import { QuiverExit } from "./QuiverExit.js";
import { QuiverError } from "./QuiverError.js";
import { QuiverSuccess } from "./QuiverSuccess.js";
import { QuiverRoute } from "./QuiverRoute.js";
import { QuiverClientRoute } from "./QuiverClientRoute.js";

export type QuiverContext = {
  received: Message;
  url?: QuiverUrl;
  json?: unknown;
  request?: QuiverRequest;
  response?: QuiverResponse<unknown>;
  resolver?: QuiverClientRoute;
  route?: QuiverRoute;
  input?: unknown;
  output?: unknown;
  throw?: Omit<QuiverError, "id" | "ok">;
  return?: Omit<QuiverSuccess<unknown>, "id" | "ok">;
  exit?: Omit<QuiverExit, "id" | "ok">;
  error?: unknown;
  sent?: Message;
};
