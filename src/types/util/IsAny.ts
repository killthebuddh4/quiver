export type IsAny<T> = 0 extends 1 & T ? T : never;
