import { Message } from "./Message.js";
import { QuiverRequest } from "./QuiverRequest.js";

export type QuiverCall = (
  address: string,
  namespace: string,
  request: QuiverRequest,
) => Promise<Message>;
