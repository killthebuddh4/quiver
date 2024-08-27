import { QuiverContext } from "../types/QuiverContext.js";

export const isDone = (context: QuiverContext) => {
  return (
    context.throw === undefined ||
    context.exit === undefined ||
    context.return === undefined
  );
};
