import { QuiverError } from "./QuiverError.js";
import { QuiverSuccess } from "./QuiverSuccess.js";

export type QuiverResponse = {
  id: string;
  data: QuiverSuccess<unknown> | QuiverError;
};
