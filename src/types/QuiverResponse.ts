import { QuiverThrow } from "./QuiverError.js";
import { QuiverSuccess } from "./QuiverSuccess.js";

export type QuiverResponse<D> = QuiverSuccess<D> | QuiverThrow;
