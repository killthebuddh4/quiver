import { Message } from "./Message.js";
import { Conversation } from "./Conversation.js";
import { Signer } from "./xmtp/Signer.js";

export interface QuiverXmtp {
  signer: Signer;

  address: string;

  start: () => Promise<QuiverXmtp>;

  stop: () => void;

  subscribe: (
    handler: (message: Message) => void,
  ) => Promise<{ unsubscribe: () => void }>;

  publish: (args: {
    conversation: Conversation;
    content: string;
  }) => Promise<Message>;
}
