import { Message } from "./Message.js";
import { BrpcResponse } from "./brpc.js";

export type ResponseHandler = (args: {
  ctx: { message: Message; detach: () => void };
  response: BrpcResponse;
}) => void;
