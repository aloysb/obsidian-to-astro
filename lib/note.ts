import { Emitter } from "./eventEmitter.ts";
import { blogSchema } from "./schema.ts";
import { parse } from "https://deno.land/std@0.171.0/encoding/yaml.ts";
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";
export interface NoteProps {
   filePath: string;
}
export type Frontmatter = z.infer<typeof blogSchema>;

/**
 * Class representing the parsed version of a note.
 */
export class Note {
   readonly filePath: string;
   readonly rawFile: string;
   readonly frontmatter: Frontmatter | null;
   private handlers: ((note: this) => void)[] = [];

   /**
    * Create a note
    * @param filePath the path of file
    * @param handlers an array of handler to execute when processing the note
    * @param onCreatedNote a hook to run a function on note creation
    */
   constructor(
      filePath: string,
      handlers: ((note: Note) => void)[] = [],
      onNoteCreatedEmitter: Emitter<Note>
   ) {
      this.filePath = filePath;
      this.rawFile = Deno.readTextFileSync(filePath);
      this.frontmatter = this.parseFrontmatter();
      this.handlers = handlers;
      onNoteCreatedEmitter.emit(this);
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
    * Process the note, as per handlers;
    */
   public process() {
      this.handlers.forEach((handler) => handler(this));
   }
}
