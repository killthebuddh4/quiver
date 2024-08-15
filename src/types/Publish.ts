import { Message } from "./Message.js";
import { Topic } from "./Topic.js";

export type Publish = (args: {
  topic: Topic;
  content: unknown;
  options?: {
    onCreatingTopic?: (args: { topic: Topic }) => void;
    onCreatedTopic?: (args: { topic: Topic }) => void;
    onCreateTopicError?: (args: { topic: Topic; error: unknown }) => void;
    onSendingMessage?: (args: { topic: Topic; content: unknown }) => void;
    onSentMessage?: (args: { message: Message }) => void;
    onSendError?: (args: { topic: Topic; error: unknown }) => void;
  };
}) => Promise<{ published: Message }>;
