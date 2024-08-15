import { z } from "zod";

export const quiverSuccessSchema = z.object({
  ok: z.literal(true),
  status: z.literal("SUCCESS"),
  data: z.unknown(),
});
