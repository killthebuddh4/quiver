export type NewKey<R, K extends string = string> = K extends keyof R
  ? never
  : K;
