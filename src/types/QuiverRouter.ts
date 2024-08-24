import { QuiverHandler } from "./QuiverHandler.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";

export type QuiverRouter = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bind: () => {
    namespace: string;
    handler: QuiverHandler;
  };
  use: (mw: QuiverMiddleware) => void;
};
