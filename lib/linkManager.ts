import { Note } from "./note.ts";

/**
 * LinkManager is in charge of handling wikilinks and replacing them with markdown friendly links.
 * To do so, it needs to be aware of the notes.
 */
export class LinkManager {
  private readonly _notes: Note[] = [];

  /**
   * Register a note in the link manager.
   * The link manager must be aware of existing notes to replace the wikilinks.
   * @param note Note to register
   */
  public registerNote(note: Note) {
    this._notes.push(note);
  }

  public get notes() {
    return this._notes;
  }

  public replaceWikiLinks(_note: Note) {
    //       return notes.map((note) => {
    //         const { content } = note;
    //         const lines = content.split("\n");
    //         note.content = lines
    //           .map((line: string) => {
    //             const regexp = /\[\[.+?\|?.*?\]\]/g;
    //             const wikilinks = line.match(regexp);
    //             if (!wikilinks) {
    //               return line;
    //             }
    //             const newLine = line.replace(regexp, processLink);
    //             return newLine;
    //             function processLink(link: string): string {
    //               const [file, title] = link.slice(2, -2).split("|");
    //               const linkedNote = notes.find(
    //                 (note) => note.title === `${file}.md`,
    //               );
    //               if (!linkedNote) {
    //                 console.log(
    //                   `${note.filePath} has a link to '${file}' that we could not resolve. The link has been ignored.`,
    //                 );
    //                 const replace = `${title ?? file}`;
    //                 return replace;
    //               }
    //               const replace = `[${
    //                 title ?? file
    //               }](./${linkedNote.frontmatter.slug})`;
    //               return replace;
    //             }
    //           })
    //           .join("\n");
    //         return note;
    //       });
  }
}
