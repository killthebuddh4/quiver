export type Maybe<T> =
  | {
      ok: true;
      value: T;
      code?: undefined;
      reason?: undefined;
    }
  | {
      ok: false;
      value?: undefined;
      code: string;
      reason?: string;
    };
