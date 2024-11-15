import { Message } from "./Message.js";
import { Conversation } from "./Conversation.js";
import { Signer } from "./util/Signer.js";

export type QuiverXmtpOptions = {
  init?: {
    // NOTE Only signer is supported for now. It should be very simple to add
    // more options here, but we don't need them yet.
    signer?: Signer;
    key?: string;
    identity?: string;
    env?: "production" | "dev";
  };
  logs?: {
    create?: {
      onSignerCreated?: (signer: Signer) => void;
    };
    start?: {
      onStartXmtpError?: (error: unknown) => void;
      onStartStreamError?: (error: unknown) => void;
    };
    handle?: {
      onSelfSentMessage?: (message: Message) => void;
      onMessage?: (message: Message) => void;
      onHandlerError?: (error: unknown) => void;
      onHandling?: (message: Message) => void;
    };
    pubsub?: {
      onSubscribe?: () => void;
      onUnsubscribe?: () => void;
      onPublishing?: (conversation: Conversation, content: string) => void;
      onSentMessage?: (message: Message) => void;
      onCreateConversationError?: (
        conversation: Conversation,
        error: unknown,
      ) => void;
      onSendMessageError?: (content: unknown, error: unknown) => void;
    };
  };
  throwOnHandlerError?: boolean;
};
