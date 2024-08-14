import { Message } from "./Message.js";

export type Subscribe = (handler: (message: Message) => void) => {
  unsubscribe: () => void;
};
