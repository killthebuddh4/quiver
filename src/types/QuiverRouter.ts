import { QuiverHandler } from "./QuiverHandler.js";

export type QuiverRouter = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bind: () => {
    namespace: string;
    handler: QuiverHandler;
  };
  use: (mw: QuiverHandler) => void;
};
