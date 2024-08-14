import { Message } from "./Message.js";

export type HandlerOptions = {
  onSelfSentMessage?: (args: { message: Message }) => void;
  onNoHandlersForMessage?: (args: { message: Message }) => void;
  onHandlingMessage?: (args: { message: Message }) => void;
  onHandlerError?: (error: Error) => void;
};
