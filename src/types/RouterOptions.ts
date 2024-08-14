import { Message } from "./Message.js";

export type RouterOptions = {
  onReceivedMessage?: ({ message }: { message: Message }) => void;
  onSelfSentMessage?: ({ message }: { message: Message }) => void;
  onTopicMismatch?: ({ message }: { message: Message }) => void;
  onReceivedInvalidJson?: ({ message }: { message: Message }) => void;
  onReceivedInvalidRequest?: ({ message }: { message: Message }) => void;
  onUnknownProcedure?: () => void;
  onAuthError?: () => void;
  onUnauthorized?: () => void;
  onInputTypeMismatch?: () => void;
  onHandlingMessage?: () => void;
  onHandlerError?: () => void;
  onOutputSerializationError?: () => void;
  onSendingResponse?: () => void;
  onSentResponse?: ({ sent }: { sent: Message }) => void;
  onSendResponseError?: () => void;
};
