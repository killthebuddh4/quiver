import { z } from "zod";

export const quiverErrorSchema = z.object({
  ok: z.literal(false),
  status: z.union([
    z.literal("INPUT_SERIALIZATION_FAILED"),
    z.literal("XMTP_SEND_FAILED"),
    z.literal("XMTP_BROADCAST_FAILED"),
    z.literal("UNKNOWN_FUNCTION"),
    z.literal("INPUT_TYPE_MISMATCH"),
    z.literal("OUTPUT_TYPE_MISMATCH"),
    z.literal("OUTPUT_SERIALIZATION_FAILED"),
    z.literal("INVALID_RESPONSE"),
    z.literal("INVALID_PAYLOAD"),
    z.literal("UNAUTHORIZED"),
    z.literal("REQUEST_TIMEOUT"),
    z.literal("SERVER_ERROR"),
  ]),
});
