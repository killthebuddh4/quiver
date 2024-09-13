import { Maybe } from "./util/Maybe.js";

export type QuiverParser<T> = (value: unknown) => Maybe<T>;
