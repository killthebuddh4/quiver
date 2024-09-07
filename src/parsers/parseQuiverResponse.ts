import { Maybe } from "../types/Maybe.js";
import { QuiverResponse } from "../types/QuiverResponse.js";
import { parseQuiverError } from "./parseQuiverError.js";
import { parseQuiverSuccess } from "./parseQuiverSuccess.js";

export const parseQuiverResponse = (
  value: unknown,
): Maybe<QuiverResponse<unknown>> => {
  const error = parseQuiverError(value);

  if (error.ok) {
    return error;
  }

  const success = parseQuiverSuccess(value);

  if (success.ok) {
    return success;
  }

  return {
    ok: false,
    code: "INVALID_RESPONSE",
    reason: `Response is not a QuiverError or QuiverSuccess`,
  };
};
