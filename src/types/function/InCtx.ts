export type InCtx<F> = F extends (...args: infer Args) => any ? Args[1] : never;
