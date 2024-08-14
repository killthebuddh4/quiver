import { StartPubSub } from "./StartPubSub.js";
import { Publish } from "./Publish.js";
import { Subscribe } from "./Subscribe.js";

export type PubSub = {
  address: string;
  start: StartPubSub;
  stop: () => void;
  subscribe: Subscribe;
  publish: Publish;
};
