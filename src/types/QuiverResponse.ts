import { QuiverErrorResponse } from "./QuiverErrorResponse.js";
import { QuiverSuccessResponse } from "./QuiverSuccessResponse.js";

export type QuiverResponse<D> = QuiverSuccessResponse<D> | QuiverErrorResponse;
