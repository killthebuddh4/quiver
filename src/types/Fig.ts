import { Message } from "./Message.js";
import { Conversation } from "./Conversation.js";

export type Fig = {
  start: () => Promise<void>;
  stop: () => void;
  publish: (args: {
    conversation: Conversation;
    content: unknown;
  }) => Promise<Message>;
  subscribe: (handler: (message: Message) => void) => Promise<{
    unsubscribe: () => Promise<void>;
  }>;
};
