import { z } from "zod";

// TODO: This schema duplicates the one in @repo/lib but for some reason my IDE
// has some issues with the import path. I'll fix it later.

export const jsonStringSchema = z.string().transform((val, ctx) => {
  try {
    return JSON.parse(val);
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
    });

    return z.NEVER;
  }
});
