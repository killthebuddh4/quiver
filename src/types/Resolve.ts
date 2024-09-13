export type Resolve<T> = T extends { [key: string]: any }
  ? { [K in keyof T]: Resolve<T[K]> }
  : T;
