export type In<F> = F extends (...args: infer Args) => any ? Args[0] : never;
