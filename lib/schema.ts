import { z } from "./deps.ts";

export const blogSchema = z.object({
  title: z.string(),
  status: z.enum(["publish"]),
  tags: z.array(z.string()),
  created_at: z.date(),
  last_modified_at: z.date(),
  published_at: z.date().optional(),
  description: z.string(),
  slug: z.string().optional(),
});
