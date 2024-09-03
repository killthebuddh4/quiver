import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { QuiverHandler } from "./types/QuiverHandler.js";

export const createMiddleware = <I, O>(
  handler: QuiverHandler<I, O>,
): QuiverMiddleware<I, O> => {
  const handlers: QuiverHandler<any, any>[] = [handler];

  const run: QuiverHandler<I, O> = async (context) => {
    let ctx = context;

    for (const h of handlers) {
      ctx = await h(ctx);
    }

    return ctx as unknown as O;
  };

  const use = <M>(handler: QuiverHandler<O, M>): QuiverMiddleware<I, M> => {
    handlers.push(handler);

    return { use, run } as unknown as QuiverMiddleware<I, M>;
  };

  return {
    use,
    run,
  };
};
