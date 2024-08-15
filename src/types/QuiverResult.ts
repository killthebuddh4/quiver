import { QuiverSuccess } from "./QuiverSuccess.js";
import { QuiverError } from "./QuiverError.js";

export type QuiverResult<D> = {
  request?: string;
  response?: string;
} & (QuiverSuccess<D> | QuiverError);
