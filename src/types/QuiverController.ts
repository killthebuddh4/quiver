import { Conversation } from "./Conversation.js";
import { Message } from "./Message.js";
import { QuiverClientRoute } from "./QuiverClientRoute.js";
import { QuiverRoute } from "./QuiverRoute.js";

export type QuiverController = {
  address: string;
  routes: QuiverRoute[];
  resolvers: QuiverClientRoute[];
  send: (args: {
    conversation: Conversation;
    content: string;
  }) => Promise<Message>;
};
