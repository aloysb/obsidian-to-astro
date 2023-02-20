import { parseYAML, stringify, z } from "../deps.ts";

import { blogSchema } from "./schema.ts";

export interface NoteProps {
  filePath: string;
}
export type Frontmatter = z.infer<typeof blogSchema>;

/**
 * Class representing the parsed version of a note.
 */
export class Note {
  readonly filePath: string;
  readonly frontmatter: Frontmatter;
  readonly originalFile: string;
  readonly originalFrontmatter: string | null;
  private _processedFile: string | null = null;

  /*
   * Getters
   */
  public get processedFile(): string | null {
    return this._processedFile;
  }

  /**
   * Create a note if it is createable!
   * This prevent from creating faulty notes
   *
   * @param filePath
   * @param onNoteCreatedEmitter
   * @param linkManager
   * @returns
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
  /**
   * Create a note
   * @param filePath the path of file
   * @param handlers an array of handler to execute when processing the note
   * @param onCreatedNote a hook to run a function on note creation
   */
  private constructor(
    filePath: string,
  ) {
    this.filePath = filePath;
    this.originalFile = Deno.readTextFileSync(filePath);
    this.frontmatter = this.parseFrontmatter();
    this.originalFrontmatter = this.getRawFrontMatter();
  }
  /**
   * Return the raw content of the note, as is.
   * This does not include frontmatter.
   */
  public get originalContent(): string | null {
    try {
      return this.originalFile.split("---")[2].trim();
    } catch {
      return null;
    }
  }

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

  /**
   *  Parse the file frontmatter. Returns null if there is no frontmatter
   *  @private
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

  private getRawFrontMatter() {
    return this.originalFile.split("---")[1] as string;
  }
}
