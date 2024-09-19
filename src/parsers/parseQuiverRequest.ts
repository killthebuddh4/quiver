import { Maybe } from "../types/util/Maybe.js";
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

  if (!("arguments" in json)) {
    return {
      ok: false,
      code: "ARGUMENTS_NOT_FOUND",
      reason: `value.arguments is not present`,
    };
  }

  return {
    ok: true,
    value: {
      arguments: json.arguments,
    },
  };
};
