import { z } from "zod";

export const quiverErrorSchema = z.object({
  id: z.string(),
  ok: z.literal(false),
  status: z.union([
    z.literal("XMTP_NETWORK_ERROR"),
    z.literal("INPUT_SERIALIZATION_FAILED"),
    z.literal("NO_REQUEST_HANDLER"),
    z.literal("OUTPUT_TYPE_MISMATCH"),
    z.literal("INVALID_RESPONSE"),
    z.literal("REQUEST_TIMEOUT"),
    z.literal("INVALID_REQUEST"),
    z.literal("UNKNOWN_FUNCTION"),
    z.literal("INPUT_INVALID_JSON"),
    z.literal("INPUT_TYPE_MISMATCH"),
    z.literal("OUTPUT_SERIALIZATION_FAILED"),
    z.literal("UNAUTHORIZED"),
    z.literal("SERVER_ERROR"),
    z.literal("CLIENT_ERROR"),
  ]),
  reason: z.string().optional(),
});
