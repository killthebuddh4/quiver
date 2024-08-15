import { QuiverFunction } from "./QuiverFunction.js";

export type QuiverApiSpec = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: Omit<QuiverFunction<any, any>, "handler">;
};
