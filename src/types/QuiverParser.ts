import { Maybe } from "./Maybe.js";

export type QuiverParser<T> = (value: unknown) => Maybe<T>;
