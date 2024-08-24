import { Message } from "../types/Message.js";
import { Maybe } from "../types/Maybe.js";
import { quiverSuccessSchema } from "./quiverSuccessSchema.js";
import { quiverErrorSchema } from "./quiverErrorSchema.js";
import { QuiverResponse } from "../types/QuiverResponse.js";

export const parseResponse = (
  message: Message,
): Maybe<QuiverResponse<unknown>> => {
  let json;
  try {
    json = JSON.parse(String(message.content));
  } catch {
    return {
      ok: false,
      code: "JSON_PARSE_ERROR",
      reason: `Failed to parse JSON from message ${message.id}`,
    };
  }

  const err = quiverErrorSchema.safeParse(json);

  if (err.success) {
    return {
      ok: true,
      value: err.data,
    };
  }

  const success = quiverSuccessSchema.safeParse(json);

  if (success.success) {
    return {
      ok: true,
      value: success.data,
    };
  }

  return {
    ok: false,
    code: "INVALID_RESPONSE",
    reason: `Failed to parse response from for message ${message.id}.`,
  };
};
