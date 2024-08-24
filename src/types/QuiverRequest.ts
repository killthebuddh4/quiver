import { z } from "zod";
import { quiverRequestSchema } from "../lib/quiverRequestSchema.js";

export type QuiverRequest = z.infer<typeof quiverRequestSchema>;
