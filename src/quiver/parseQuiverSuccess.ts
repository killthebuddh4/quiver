import { Maybe } from "../types/Maybe.js";
import { QuiverSuccess } from "../types/QuiverSuccess.js";

export const parseQuiverSuccess = (
  value: unknown,
): Maybe<QuiverSuccess<unknown>> => {
  let json;
  if (typeof value === "string") {
    try {
      json = JSON.parse(value);
    } catch {
      return {
        ok: false,
        code: "INVALID_JSON_STRING",
        reason: `value is a string, but it's not valid JSON: ${value}`,
      };
    }
  } else {
    json = value;
  }

  if (json === null) {
    return {
      ok: false,
      code: "INVALID_JSON_NULL",
      reason: `value is null`,
    };
  }

  if (typeof json !== "object") {
    return {
      ok: false,
      code: "INVALID_JSON_TYPE",
      reason: `value is not an object, it's ${typeof json}`,
    };
  }

  if (typeof json.id !== "string") {
    return {
      ok: false,
      code: "INVALID_ID_TYPE",
      reason: `value id is not a string, it's ${typeof json.id}`,
    };
  }

  if (typeof json.ok !== "boolean") {
    return {
      ok: false,
      code: "INVALID_OK_TYPE",
      reason: `value ok is not a boolean, it's ${typeof json.ok}`,
    };
  }

  if (json.ok !== true) {
    return {
      ok: false,
      code: "INVALID_OK_VALUE",
      reason: `value ok is not true, it's ${json.ok}`,
    };
  }

  if (json.status !== "SUCCESS") {
    return {
      ok: false,
      code: "INVALID_STATUS_VALUE",
      reason: `value status is not "SUCCESS", it's ${json.status}`,
    };
  }

  if (json.data === undefined) {
    return {
      ok: false,
      code: "INVALID_DATA_MISSING",
      reason: `value is missing data`,
    };
  }

  return {
    ok: true,
    value: {
      id: json.id,
      ok: json.ok,
      status: json.status,
      data: json.data,
    },
  };
};
