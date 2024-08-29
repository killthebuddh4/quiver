import { Message } from "./Message.js";
import { QuiverPath } from "./QuiverPath.js";
import { QuiverRequest } from "./QuiverRequest.js";
import { QuiverResponse } from "./QuiverResponse.js";
import { QuiverExit } from "./QuiverExit.js";
import { QuiverError } from "./QuiverError.js";
import { QuiverSuccess } from "./QuiverSuccess.js";
import { QuiverRoute } from "./QuiverRoute.js";
import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverContext = {
  address: string;
  received: Message;
  path?: QuiverPath;
  json?: unknown;
  request?: QuiverRequest;
  response?: QuiverResponse<unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function?: QuiverFunction<any, any>;
  route?: QuiverRoute;
  throw?: Omit<QuiverError, "id" | "ok">;
  return?: Omit<QuiverSuccess<unknown>, "id" | "ok">;
  exit?: Omit<QuiverExit, "id" | "ok">;
  error?: unknown;
  abort?: unknown;
  sent?: Message;
};
