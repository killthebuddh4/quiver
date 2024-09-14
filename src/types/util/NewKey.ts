export type NewKey<R, K extends string> = K extends keyof R ? never : K;
