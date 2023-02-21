import { z } from "../deps.ts";

/**
 * Blog schema processed
 * This schema is used to validate the frontmatter of the notes after processing
 * It is used to make sure that the frontmatter is consistent
 */
export const processedBlogSchema = z.object({
  title: z.string(),
  status: z.enum(["published", "draft", "private", "archived", "deleted"]),
  tags: z.array(z.string()),
  created_at: z.date(),
  last_modified_at: z.date(),
  published_at: z.date(),
  description: z.string(),
  slug: z.string(),
});

/**
 * Blog schema original
 * This schema is used to validate the frontmatter of the notes before processing
 * It is used to make sure that the frontmatter is consistent
 */
export const originalBlogSchema = z.object({
  title: z.string(),
  status: z.enum(["published", "draft", "private", "archived", "deleted"]),
  tags: z.array(z.string()),
  created_at: z.string(),
  last_modified_at: z.string(),
  published_at: z.string().optional(),
  description: z.string(),
  slug: z.string(),
});
