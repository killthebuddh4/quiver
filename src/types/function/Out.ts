export type Out<F> = F extends (...args: any[]) => infer R ? R : never;
