import { Message } from "./Message.js";

export type Subscribe = (args: { handler: (message: Message) => void }) => {
  unsubscribe: () => void;
};
