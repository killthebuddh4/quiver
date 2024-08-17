import { Message } from "./Message.js";

export type QuiverRouterOptions = {
  namespace?: string;
  onReceivedMessage?: (args: { message: Message }) => void;
  onSelfSentMessage?: (args: { message: Message }) => void;
  onTopicMismatch?: (args: { message: Message }) => void;
  onReceivedInvalidJson?: (args: { message: Message }) => void;
  onReceivedInvalidRequest?: (args: { message: Message }) => void;
  onUnknownFunction?: () => void;
  onAuthError?: (args: { error: unknown }) => void;
  onUnauthorized?: () => void;
  onInputTypeMismatch?: () => void;
  onHandlingInput?: (args: { input: unknown }) => void;
  onHandlerError?: (args: { error: unknown }) => void;
  onOutputSerializationError?: () => void;
  onSendingResponse?: () => void;
  onSentResponse?: ({ sent }: { sent: Message }) => void;
  onSendResponseError?: () => void;
};
