import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

export const blogSchema = z.object({
  title: z.string(),
  status: z.enum(["publish"]),
  tags: z.array(z.string()),
  created_at: z.date(),
  last_modified_at: z.date(),
  published_at: z.date(),
  lang: z.enum(["en-AU"]),
  description: z.string().optional().nullable(),
});
