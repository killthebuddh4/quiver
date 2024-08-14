import { StartPubSubOptions } from "./StartPubSubOptions.js";

export type StartPubSub = (args: {
  options?: StartPubSubOptions;
}) => Promise<void>;
