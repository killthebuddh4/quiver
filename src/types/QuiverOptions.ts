import { Wallet } from "@ethersproject/wallet";
import { Message } from "./Message.js";
import { Conversation } from "./Conversation.js";

export type QuiverOptions = {
  wallet?: Wallet;
  env?: "dev" | "production";
  onAlreadyCreated?: () => void;
  onCreateWalletError?: (error: unknown) => void;
  onCreatingXmtp?: () => void;
  onCreatedXmtp?: () => void;
  onCreateXmtpError?: (error: unknown) => void;
  onStartingStream?: () => void;
  onStartedStream?: () => void;
  onStartStreamError?: (error: unknown) => void;
  onMessageReceived?: (message: Message) => void;
  onMissedMessage?: (message: Message) => void;
  onHandlerError?: (error: unknown) => void;
  onCreatingTopic?: (args: { topic: Conversation }) => void;
  onCreatedTopic?: (args: { topic: Conversation }) => void;
  onCreateTopicError?: (args: { topic: Conversation; error: unknown }) => void;
  onSendingMessage?: (args: { topic: Conversation }) => void;
  onSentMessage?: (args: { message: Message }) => void;
  onSendError?: (args: { topic: Conversation }) => void;
  onReceivedInvalidJson?: () => void;
};
