import { Maybe } from "../types/Maybe.js";
import { QuiverRequest } from "../types/QuiverRequest.js";

export const parseQuiverRequest = (value: unknown): Maybe<QuiverRequest> => {
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

  if (typeof json.function !== "string") {
    return {
      ok: false,
      code: "INVALID_FUNCTION_TYPE",
      reason: `value.function is not a string, it's ${typeof json.function}`,
    };
  }

  // TODO This might be too tight of a restriction
  if (typeof json.arguments !== "object") {
    return {
      ok: false,
      code: "INVALID_ARGUMENTS_TYPE",
      reason: `value.arguments is not an object, it's ${typeof json.arguments}`,
    };
  }

  return {
    ok: true,
    value: {
      function: json.function,
      arguments: json.arguments,
    },
  };
};
