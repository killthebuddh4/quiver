import { z } from "zod";

export const quiverRequestSchema = z.object({
  function: z.string(),
  arguments: z.unknown(),
});
