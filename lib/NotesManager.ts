import { Config } from "./Config.ts";
import Logger from "./Logger.ts";
import { Note } from "./Note.ts";
import { findFilesRecursively } from "./utils.ts";
import { join } from "../deps.ts";

type NotesManagerArgs = {
   config: Config;
};

/**
 * The NotesManager is the central class of the program.
 * It handles the creation, update and publication of the notes.
 * It is a singleton and can be initialized only once.
 */
export class NotesManager {
   private static instance: NotesManager;
   private _notes: Note[] = [];
   private readonly config: Config;

   /*
    * Getters
    */
   public get notes() {
      return this._notes;
   }

   /*
    * Constructor
    * Private because we want to use the static method to create a NotesManager
    */
   private constructor(args: NotesManagerArgs) {
      this.config = args.config;
   }

   /*
    * Static methods
    */

   /**
    *  Create a NotesManager instance.
    *  The reason we need to go through this initialization process is because
    *  we need to await the creation of the notes.
    *  We can't do that in the constructor because it's not async.
    */
   public static async initialize(
      args: NotesManagerArgs
   ): Promise<NotesManager> {
      if (this.instance) {
         return this.instance;
      }
      const notesManager = new NotesManager(args);
      await notesManager.createNotes();
      await notesManager.processNotes();
      this.instance = notesManager;
      return notesManager;
   }

   /*
    * Public methods
    */

   /*
    * Publish the notes to the destination directory
    */
   public publishNotes() {
      let notesPublished = 0;
      for (const note of this._notes) {
         if (note.processedFrontmatter.draft) {
            Logger.get().info(
               note.processedFrontmatter.title +
                  " is a draft. It has been ignored."
            );
            continue;
         }

         const slug = note.processedFrontmatter.slug;
         if (!slug) {
            Logger.get().warning(
               note.processedFrontmatter.title +
                  " has no slug. It has been ignored."
            );
            continue;
         }

         if (!note.processedFile) {
            Logger.get().info(`No content for note: ${note.filePath}.md`);
            continue;
         }

         Deno.writeTextFileSync(
            join(this.config.blogDir, `${slug}.md`),
            note.processedFile
         );

         notesPublished++;
         Logger.get().info(`Note published: ${slug}.md`);
      }
      Logger.get().info(`Notes published: ${notesPublished}`);
   }

   /*
    * Private methods
    */

   /**
    * Look for all the notes in the source directory and create them.
    * Do not create the notes if they are not valid.
    */
   private async createNotes() {
      const files = await findFilesRecursively(this.config.sourceDir, {
         match: /\.md/,
      });
      const notes: Note[] = [];
      for (const file of files) {
         const maybeNote = Note.new(file);
         if (maybeNote) {
            Logger.get().debug(`${maybeNote} created.`);
            notes.push(maybeNote as Note);
         } else {
            Logger.get().debug(`${file} is not a note. It has been ignored.`);
         }
      }
      this._notes = notes;

      Logger.get().info("NotesManager initialized.");
      Logger.get().info(`Notes created: ${notes.length}`);
      Logger.get().info(`Notes ignored: ${files.length - notes.length}`);
      Logger.get().info(`Total files: ${files.length}`);
   }

   /**
    * Process the notes.
    * This is where we replace the wikilinks by markdown links.
    */
   private processNotes() {
      for (const note of this._notes) {
         const newContent = this.replaceWikiLinks(note);
         const filename = note.filePath.split("/").pop();
         if (!newContent) {
            Logger.get().info(`No content for note: ${filename}`);
         } else {
            Logger.get().info(`New content for note: ${filename}`);
            note.processedFile = newContent;
         }
      }
   }

   /**
    * Replace all the wikilinks in the notes by markdown links.
    */
   private replaceWikiLinks(note: Note): string | null {
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
            const newLine = line.replace(regexp, (link) =>
               this.processLink(note, link)
            );
            return newLine;
         })
         .join("\n");
      return result;
   }

   /**
    * Replace a wikilink by a markdown link.
    */
   private processLink(note: Note, link: string): string {
      const [file, title] = link.slice(2, -2).split("|");
      const targetNote = this._notes.find(
         (note) => note.processedFrontmatter?.title === file
      );
      if (!targetNote) {
         console.log(
            `${note.filePath} has a link to '${file}' that we could not resolve. The link has been ignored.`
         );
         const replace = `${title ?? file}`;
         return replace;
      }
      const replace = `[${title ?? file}](./${
         targetNote.processedFrontmatter?.slug
      })`;
      return replace;
   }
}
