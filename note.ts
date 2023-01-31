import { parse } from "https://deno.land/std@0.171.0/encoding/yaml.ts";
export interface NoteProps {
  filePath: string;
}

type Frontmatter = {
  title: string;
  tags: string[];
  created_at: Date;
  last_modified_at: Date;
  status: "idea" | "publish" | "draft";
  slug: string;
};
export class Note {
  readonly filePath: string;
  readonly rawFile: string;
  readonly frontmatter: Frontmatter | null;

  constructor(filePath: string, onCreatedNote: (note: Note) => void) {
    this.filePath = filePath;
    this.rawFile = Deno.readTextFileSync(filePath);
    this.frontmatter = this.parseFrontmatter();
    onCreatedNote(this);
  }
  /**
   * Return the raw content of the note, as is.
   * This does not include frontmatter.
   */
  public get rawContent(): string | null {
    try {
      return this.rawFile.split("---")[2].trim();
    } catch {
      return null;
    }
  }

  /**
   *  Parse the file frontmatter. Returns null if there is no frontmatter
   *  @private
   */
  private parseFrontmatter(): Frontmatter | null {
    try {
      const rawFrontmatter = this.rawFile.split("---")[1] as string;
      const frontmatter = parse(rawFrontmatter) as Frontmatter;
      return {
        ...frontmatter,
        last_modified_at: new Date(frontmatter.last_modified_at),
        created_at: new Date(frontmatter.created_at),
      };
    } catch {
      return null;
    }
  }

  /**
   * Find and replace the wikilinks
   * @private
   */
}
