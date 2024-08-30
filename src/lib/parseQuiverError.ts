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

  if (!STATUSES.includes(json.status)) {
    return {
      ok: false,
      code: "INVALID_STATUS",
      reason: `error status is not a valid Quiver error status, it's ${json.status}`,
    };
  }

  if (json.reason !== undefined && typeof json.reason !== "string") {
    return {
      ok: false,
      code: "INVALID_REASON_TYPE",
      reason: `error reason is not a string, it's ${typeof json.reason}`,
    };
  }

  return {
    ok: true,
    value: {
      id: json.id,
      ok: json.ok,
      status: json.status,
      reason: json.reason,
    },
  };
};

const STATUSES = [
  "XMTP_NETWORK_ERROR",
  "INPUT_SERIALIZATION_FAILED",
  "NO_REQUEST_HANDLER",
  "OUTPUT_TYPE_MISMATCH",
  "INVALID_RESPONSE",
  "REQUEST_TIMEOUT",
  "INVALID_REQUEST",
  "UNKNOWN_FUNCTION",
  "UNKNOWN_NAMESPACE",
  "INVALID_PATH",
  "INPUT_INVALID_JSON",
  "INPUT_TYPE_MISMATCH",
  "OUTPUT_SERIALIZATION_FAILED",
  "UNAUTHORIZED",
  "SERVER_ERROR",
  "CLIENT_ERROR",
  "UNKNOWN_NAMESPACE",
];
