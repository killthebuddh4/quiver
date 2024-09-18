import { Message } from "./Message.js";
import { Conversation } from "./Conversation.js";
import { Signer } from "./util/Signer.js";

export interface QuiverProvider {
  signer: Signer;

  start: () => Promise<QuiverProvider>;

  stop: () => void;

  subscribe: (
    handler: (message: Message) => void,
  ) => Promise<{ unsubscribe: () => void }>;

  publish: (args: {
    conversation: Conversation;
    content: string;
  }) => Promise<Message>;
}
