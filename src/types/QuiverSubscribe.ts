import { Message } from "./Message.js";

export type QuiverSubscribe = (handler: (message: Message) => void) => Promise<{
  unsubscribe: () => Promise<void>;
}>;
