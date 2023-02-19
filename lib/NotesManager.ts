import { Config } from "./config.ts";
import { logger as Logger } from "./deps.ts";
import { Note } from "./note.ts";
import { findFilesRecursively } from "./utils.ts";

/**
 * The NotesManager is the central class of the program.
 * It handles the creation, update and publication of the notes.
 */
export class NotesManager {
  private readonly _notes: Note[] = [];

  private constructor() {
  }

  public async initialize(
    { config, logger }: { config: Config; logger: typeof Logger },
  ) {
    const files = await findFilesRecursively(config.sourceDir, {
      match: /\.md/,
    });
    for (const file of files) {
      const newNote = new Note(file);
      this._notes.push(newNote);
      logger.info(`${newNote} created.`);
    }
  }

  public get notes() {
    return this._notes;
  }

  /**
   * @param note The note to process
   * @returns void
   */
  public replaceWikiLinks(note: Note): string | null {
    const content = note.originalContent;
    if (!content) {
      console.log(`${note.filePath} has no content.`);
      return null;
    }
    const lines = content.split("\n");

    const result = lines
      .map((line: string) => {
        const regexp = /\[\[.+?\|?.*?\]\]/g;
        const wikilinks = line.match(regexp);
        if (!wikilinks) {
          return line;
        }
        const newLine = line.replace(
          regexp,
          (link) => this.processLink(note, link),
        );
        return newLine;
      })
      .join("\n");
    return result;
  }

  /**
   * Takes a link and replace it by a markdown link to the file
   * @param link
   * @returns
   */
  private processLink(note: Note, link: string): string {
    const [file, title] = link.slice(2, -2).split("|");
    const targetNote = this._notes.find(
      (note) => note.frontmatter?.title === file,
    );
    if (!targetNote) {
      console.log(
        `${note.filePath} has a link to '${file}' that we could not resolve. The link has been ignored.`,
      );
      const replace = `${title ?? file}`;
      return replace;
    }
    const replace = `[${title ?? file}](./${targetNote.frontmatter?.slug})`;
    return replace;
  }
}
