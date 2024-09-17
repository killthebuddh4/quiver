export type QuiverError = {
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
  | "JSON_PARSE_FAILED"
  | "RESPONSE_PARSE_FAILED"
  | "UNKNOWN_REQUEST_ID"
  | "OUTPUT_TYPE_MISMATCH";

type ServerError =
  | "SERVER_ERROR"
  | "JSON_PARSE_FAILED"
  | "REQUEST_PARSE_FAILED"
  | "UNKNOWN_FUNCTION"
  | "INPUT_TYPE_MISMATCH"
  | "OUTPUT_SERIALIZATION_FAILED"
  | "MIDDLEWARE_ERROR"
  | "UNAUTHORIZED";
