/* This type represents the contents of a response Message. */

export type QuiverErrorResponse = {
  id: string;
  ok: false;
  code: XmtpError | ClientError | ServerError;
  message?: string;
  metadata?: Record<string, unknown>;
};

type XmtpError = "XMTP_NETWORK_ERROR";

type ClientError =
  | "CLIENT_ERROR"
  | "INPUT_SERIALIZATION_FAILED"
  | "REQUEST_TIMEOUT"
  | "PARSE_RESPONSE_JSON_FAILED"
  | "PARSE_RESPONSE_FAILED"
  | "NO_REQUEST_FOR_RESPONSE"
  | "OUTPUT_TYPE_MISMATCH";

type ServerError =
  | "SERVER_ERROR"
  | "MIDDLEWARE_ERROR"
  | "HANDLER_ERROR"
  | "PARSE_REQUEST_JSON_FAILED"
  | "PARSE_REQUEST_FAILED"
  | "NO_FUNCTION_FOR_PATH"
  | "INPUT_TYPE_MISMATCH"
  // Note that right now we don't handle serialization errors very well. They
  // end up being mostly silent.
  | "OUTPUT_SERIALIZATION_FAILED"
  | "UNAUTHORIZED";
