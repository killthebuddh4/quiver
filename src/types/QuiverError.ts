export type QuiverError = {
  id: string;
  ok: false;
  status:
    | "XMTP_NETWORK_ERROR"
    | "INPUT_SERIALIZATION_FAILED"
    | "NO_REQUEST_HANDLER"
    | "OUTPUT_TYPE_MISMATCH"
    | "INVALID_RESPONSE"
    | "REQUEST_TIMEOUT"
    | "INVALID_PATH"
    | "INVALID_REQUEST"
    | "UNKNOWN_NAMESPACE"
    | "UNKNOWN_FUNCTION"
    | "INPUT_INVALID_JSON"
    | "INPUT_TYPE_MISMATCH"
    | "OUTPUT_SERIALIZATION_FAILED"
    | "UNAUTHORIZED"
    | "CLIENT_ERROR"
    | "SERVER_ERROR";
  reason?: string;
  data?: undefined;
};
