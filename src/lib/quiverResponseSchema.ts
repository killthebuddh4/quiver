import { z } from "zod";

export const quiverResponseSchema = z.object({
  id: z.string(),
  data: z.unknown(),
});
