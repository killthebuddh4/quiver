export type Resolve<T> = T extends { [key: string]: any }
  ? { [K in keyof T]: T[K] }
  : T;
