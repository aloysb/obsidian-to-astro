import { originalBlogSchema, processedBlogSchema } from "./schema.ts";
import { parseYAML, stringify, z } from "../deps.ts";

import Logger from "./Logger.ts";

export interface NoteProps {
  filePath: string;
}
export type Frontmatter = z.infer<typeof processedBlogSchema>;

/*
 * Note class
 * This class represents a note
 * It is used to parse the frontmatter and the content of the note
 * It also provides a way to process the note
 */
export class Note {
  readonly filePath: string;
  readonly processedFrontmatter: Frontmatter;
  readonly originalFile: string;
  readonly originalFrontmatter: string | null;
  private _processedFile: string | null = null;
  private logger = Logger.get();

  /*
   * Constructor
   * Private because we want to use the static method to create a note
   */
  private constructor(filePath: string) {
    this.filePath = filePath;
    this.originalFile = Deno.readTextFileSync(filePath);
    this.processedFrontmatter = this.parseFrontmatter();
    this.originalFrontmatter = this.getRawFrontMatter();
  }

  /*
   * Getters/Setters
   */
  public get processedFile(): string | null {
    return this._processedFile;
  }

  public set processedFile(newContent: string | null) {
    if (!this.processedFrontmatter || !newContent) {
      return;
    }

    try {
      const frontmatter = stringify(this.processedFrontmatter);
      const content = newContent;
      this._processedFile = `---
${frontmatter}
--- 
${content}`;
    } catch (e) {
      console.log(`${this.processedFrontmatter.title} failed to process`, e);
      return;
    }
  }

  /*
   Return the frontmatter as a string
   If the frontmatter is not valid, return null
  */
  public get originalContent(): string | null {
    try {
      return this.originalFile.split("---")[2].trim();
    } catch {
      return null;
    }
  }

  /*
   * Static methods
   */

  /*
   Create a note
   If the note is not valid, return null
  */
  public static new(filePath: string): Note | null {
    try {
      const note = new Note(filePath);
      note.parseFrontmatter();
      return note;
    } catch {
      return null;
    }
  }

  /*
   * Methods
   */

  /*
     Parse the frontmatter
     This method will parse the frontmatter and return it
   */
  private parseFrontmatter(): Frontmatter {
    try {
      const rawFrontmatter = this.getRawFrontMatter();
      const frontmatter = parseYAML(rawFrontmatter) as Frontmatter;
      originalBlogSchema.parse(frontmatter);
      return {
        ...frontmatter,
        last_modified_at: new Date(frontmatter.last_modified_at),
        created_at: new Date(frontmatter.created_at),
        published_at: new Date(frontmatter.published_at ?? Date.now()),
        description: frontmatter.description ?? "",
        slug: frontmatter.slug ??
          frontmatter.title
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^a-z0-9-]/g, ""),
      };
    } catch (e) {
      Logger.get().error(
        `Invalid frontmatter for ${this.filePath.split("/").pop()}`,
        e.issues,
      );
      Logger.get().debug(e.issues);
      throw Error("No frontmatter found");
    }
  }

  /*
   Return the frontmatter as a string
  */
  private getRawFrontMatter() {
    return this.originalFile.split("---")[1] as string;
  }
}
