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

   /**
    * 
    * @param note The note to process
    * @returns void
    */
   public replaceWikiLinks(note: Note) {
      const content = note.rawContent;
      if (!content) {
         console.log(`${note.filePath} has no content.`);
         return;
      }
      const lines = content.split("\n");

      lines
         .map((line: string) => {
            const regexp = /\[\[.+?\|?.*?\]\]/g;
            const wikilinks = line.match(regexp);
            if (!wikilinks) {
               return line;
            }
            const newLine = line.replace(regexp, (link) =>
               this.processLink(note, link)
            );
            return newLine;
         })
         .join("\n");
      return note;
   }

   /**
    * Takes a link and replace it by a markdown link to the file
    * @param link
    * @returns
    */
   private processLink(note: Note, link: string): string {
      const [file, title] = link.slice(2, -2).split("|");
      const targetNote = this._notes.find(
         (note) => note.frontmatter?.title === `${file}.md`
      );
      if (!targetNote) {
         console.log(
            `${note.filePath} has a link to '${file}' that we could not resolve. The link has been ignored.`
         );
         const replace = `${title ?? file}`;
         return replace;
      }
      const replace = `[${title ?? file}](./${targetNote.frontmatter?.slug})`;
      return replace;
   }
}
