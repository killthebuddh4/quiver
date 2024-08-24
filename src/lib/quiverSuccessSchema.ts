import { z } from "zod";

export const quiverSuccessSchema = z.object({
  id: z.string(),
  ok: z.literal(true),
  status: z.literal("SUCCESS"),
  data: z.unknown(),
});
