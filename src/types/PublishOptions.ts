import { Topic } from "./Topic.js";
import { Message } from "./Message.js";

export type PublishOptions = {
  onCreatingTopic?: (args: { topic: Topic }) => void;
  onCreatedTopic?: (args: { topic: Topic }) => void;
  onCreateTopicFailed?: (args: { topic: Topic; error: Error }) => void;
  onPublishingMessage?: (args: { topic: Topic }) => void;
  onPublishedMessage?: (args: { topic: Topic; published: Message }) => void;
  onPublishFailed?: (args: { topic: Topic; error: Error }) => void;
};
