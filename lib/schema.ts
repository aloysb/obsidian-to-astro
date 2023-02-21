import { z } from "../deps.ts";

/**
 * Blog schema
 * This schema is used to validate the frontmatter of the notes
 * It is used to make sure that the frontmatter is consistent
 */
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
