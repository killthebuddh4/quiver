import { Message } from "./Message.js";
import { PublishOptions } from "./PublishOptions.js";
import { Topic } from "./Topic.js";

export type Publish = (args: {
  topic: Topic;
  content: string;
  options?: PublishOptions;
}) => Promise<{ published: Message }>;
