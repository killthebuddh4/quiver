import { Publish } from "./Publish.js";
import { Subscribe } from "./Subscribe.js";
import { Start } from "./Start.js";

export type Quiver = {
  address: string;
  start: Start;
  stop: () => void;
  publish: Publish;
  subscribe: Subscribe;
};
