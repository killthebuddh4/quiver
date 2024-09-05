export type QuiverHandler<I = any, O = any> = (ctx: I) => Promise<O> | O;
