export type QuiverHandler<I, O> = (context: I) => Promise<O> | O;
