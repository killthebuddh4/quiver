import { Conversation } from "./Conversation.js";

export type Message = {
  id: string;
  conversation: Conversation;
  senderAddress: string;
  sent: Date;
  content: unknown;
};
