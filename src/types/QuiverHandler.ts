export type QuiverHandler<I = any, O = any> = (context: I) => Promise<O> | O;
