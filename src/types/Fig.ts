import { Message } from "./Message.js";
import { Conversation } from "./Conversation.js";

export type Fig = {
  address: string;
  start: () => Promise<() => void>;
  stop: () => void;
  publish: (args: {
    conversation: Conversation;
    content: string;
  }) => Promise<Message>;
  subscribe: (handler: (message: Message) => void) => Promise<{
    unsubscribe: () => void;
  }>;
};
