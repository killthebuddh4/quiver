import { QuiverRequest } from "./QuiverRequest.js";
import { QuiverResponse } from "./QuiverResponse.js";

export type QuiverError = {
  ok: false;
  status:
    | "INPUT_SERIALIZATION_FAILED"
    | "XMTP_SEND_FAILED"
    | "XMTP_BROADCAST_FAILED"
    | "UNKNOWN_PROCEDURE"
    | "INPUT_TYPE_MISMATCH"
    | "OUTPUT_TYPE_MISMATCH"
    | "OUTPUT_SERIALIZATION_FAILED"
    | "INVALID_RESPONSE"
    | "INVALID_PAYLOAD"
    | "UNAUTHORIZED"
    | "REQUEST_TIMEOUT"
    | "SERVER_ERROR";
  request: QuiverRequest;
  response?: QuiverResponse;
};
