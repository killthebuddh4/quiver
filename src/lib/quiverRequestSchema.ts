import { z } from "zod";

export const quiverRequestSchema = z.object({
  id: z.string(),
  function: z.string(),
  arguments: z.unknown(),
});
