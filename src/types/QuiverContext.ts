import { Message } from "./Message.js";
import { QuiverPath } from "./QuiverPath.js";
import { QuiverRequest } from "./QuiverRequest.js";
import { QuiverResponse } from "./QuiverResponse.js";
import { QuiverExit } from "./QuiverExit.js";
import { QuiverError } from "./QuiverError.js";
import { QuiverSuccess } from "./QuiverSuccess.js";
import { QuiverHandler } from "./QuiverHandler.js";

type D = Omit<QuiverSuccess<unknown>, "id" | "ok">;
type E = Omit<QuiverError, "id" | "ok">;
type S = Omit<QuiverExit, "id" | "ok">;

export type QuiverContext = {
  message: Message;
  return?: (d: D) => void;
  throw?: (e: E) => void;
  exit?: (s: S) => void;
  data?: D;
  error?: E;
  status?: S;
  path?: QuiverPath;
  json?: unknown;
  request?: QuiverRequest;
  response?: QuiverResponse<unknown>;
  published?: Message;
};
