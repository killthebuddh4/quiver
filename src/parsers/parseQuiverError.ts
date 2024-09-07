import { Maybe } from "../types/Maybe.js";
import { QuiverError } from "../types/QuiverError.js";

export const parseQuiverError = (error: unknown): Maybe<QuiverError> => {
  let json;
  if (typeof error === "string") {
    try {
      json = JSON.parse(error);
    } catch {
      return {
        ok: false,
        code: "INVALID_JSON_STRING",
        reason: `error is a string, but it's not valid JSON: ${error}`,
      };
    }
  } else {
    json = error;
  }

  if (json === null) {
    return {
      ok: false,
      code: "INVALID_JSON_NULL",
      reason: `error is null`,
    };
  }

  if (typeof json !== "object") {
    return {
      ok: false,
      code: "INVALID_JSON_TYPE",
      reason: `error is not an object, it's ${typeof json}`,
    };
  }

  if (typeof json.id !== "string") {
    return {
      ok: false,
      code: "INVALID_ID_TYPE",
      reason: `error id is not a string, it's ${typeof json.id}`,
    };
  }

  if (typeof json.ok !== "boolean") {
    return {
      ok: false,
      code: "INVALID_OK_TYPE",
      reason: `error ok is not a boolean, it's ${typeof json.ok}`,
    };
  }

  if (json.ok !== false) {
    return {
      ok: false,
      code: "INVALID_OK_VALUE",
      reason: `error ok is not false, it's ${json.ok}`,
    };
  }

  if (!STATUSES.includes(json.code)) {
    return {
      ok: false,
      code: "INVALID_STATUS",
      reason: `error code is not a valid Quiver error code, it's ${json.code}`,
    };
  }

  if (json.message !== undefined && typeof json.message !== "string") {
    return {
      ok: false,
      code: "INVALID_MESSAGE_TYPE",
      reason: `error message is not a string, it's ${typeof json.message}`,
    };
  }

  return {
    ok: true,
    value: {
      id: json.id,
      ok: json.ok,
      code: json.code,
      message: json.message,
    },
  };
};

const STATUSES = [
  "XMTP_NETWORK_ERROR",
  "CLIENT_ERROR",
  "INPUT_SERIALIZATION_FAILED",
  "REQUEST_TIMEOUT",
  "JSON_PARSE_FAILED",
  "RESPONSE_PARSE_FAILED",
  "UNKNOWN_REQUEST_ID",
  "OUTPUT_TYPE_MISMATCH",
  "SERVER_ERROR",
  "REQUEST_PARSE_FAILED",
  "UNKNOWN_FUNCTION",
  "INPUT_TYPE_MISMATCH",
  "OUTPUT_SERIALIZATION_FAILED",
  "UNAUTHORIZED",
];
