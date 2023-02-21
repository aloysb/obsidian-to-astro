import { parseYAML, stringify, z } from "../deps.ts";

import { blogSchema } from "./schema.ts";

export interface NoteProps {
  filePath: string;
}
export type Frontmatter = z.infer<typeof blogSchema>;

/*
 * Note class
 * This class represents a note
 * It is used to parse the frontmatter and the content of the note
 * It also provides a way to process the note
 */
export class Note {
  readonly filePath: string;
  readonly frontmatter: Frontmatter;
  readonly originalFile: string;
  readonly originalFrontmatter: string | null;
  private _processedFile: string | null = null;

  /*
   * Constructor
   * Private because we want to use the static method to create a note
   */
  private constructor(
    filePath: string,
  ) {
    this.filePath = filePath;
    this.originalFile = Deno.readTextFileSync(filePath);
    this.frontmatter = this.parseFrontmatter();
    this.originalFrontmatter = this.getRawFrontMatter();
  }

  /*
   * Getters
   */
  public get processedFile(): string | null {
    return this._processedFile;
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

  private getRawFrontMatter() {
    return this.originalFile.split("---")[1] as string;
  }

  /*
   * Static methods
   */

  /*
   Create a note
   If the note is not valid, return null
  */
  public static new(
    filePath: string,
  ): Note | null {
    const note = new Note(filePath);
    try {
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
   Process the file
   This method will process the file and return the processed file
   If the file is not valid, return null
  */
  public processFile(newContent: string) {
    if (!this.parseFrontmatter()) {
      return null;
    }
    if (!this.frontmatter) {
      return null;
    }
    try {
      const frontmatter = stringify(this.frontmatter);
      const content = newContent;
      this._processedFile = `---
${frontmatter}
--- 
${content}`;
    } catch (e) {
      console.log(`${this.frontmatter.title} failed to process`, e);
      return null;
    }
  }

  /*
     Parse the frontmatter
     This method will parse the frontmatter and return it
   */
  private parseFrontmatter(): Frontmatter {
    try {
      const rawFrontmatter = this.getRawFrontMatter();
      const frontmatter = parseYAML(rawFrontmatter) as Frontmatter;
      return {
        ...frontmatter,
        last_modified_at: new Date(frontmatter.last_modified_at),
        created_at: new Date(frontmatter.created_at),
      };
    } catch {
      throw Error("No frontmatter found");
    }
  }
}
