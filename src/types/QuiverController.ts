import { Conversation } from "./Conversation.js";
import { Message } from "./Message.js";

export type QuiverController = {
  address: string;
  send: (args: {
    conversation: Conversation;
    content: string;
  }) => Promise<Message>;
};
