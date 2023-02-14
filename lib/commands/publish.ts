import { Command } from "../cli.ts";
import { Config } from "../config.ts";
import { join, logger } from "../deps.ts";
import { Emitter } from "../eventEmitter.ts";
import { LinkManager } from "../linkManager.ts";
import { Note } from "../note.ts";
import {
  findFilesRecursively,
  prepareBackups,
  prepareDestDirectory,
} from "../utils.ts";

export class PublishCommand implements Command<never> {
  public async execute(
    { sourceDir, blogDir }: Pick<
      ReturnType<typeof Config.retrieve>,
      "blogDir" | "sourceDir"
    >,
  ) {
    const shouldProceed = confirm(`Using the following directories:
    - Blog: ${blogDir},
    - Vault: ${sourceDir},
    Do you want to proceed?
`);

    if (!shouldProceed) {
      console.log("Cancelling. Not post published");
      return;
    }
    try {
      prepareBackups(
        sourceDir,
        blogDir,
        join(Deno.env.get("HOME") ?? ".vault2blog/", "/.vault2blog/backups"),
      );
    } catch (e) {
      logger.error(e);
      Deno.exit(1);
      return;
    }

    const notes = [];
    const linkManager = new LinkManager();

    // Create a note created emitter
    const onNoteCreatedEmitter = new Emitter<Note>();

    // Registers handlers at note creation
    onNoteCreatedEmitter.on(linkManager.registerNote.bind(linkManager));
    onNoteCreatedEmitter.on((note: Note) =>
      logger.info(`${note.frontmatter?.title} created`)
    );

    // Get all notes
    const noteFilePaths = await findFilesRecursively(sourceDir, {
      match: new RegExp(".*.md$"),
    });

    // Create all notes
    for (const filePath of noteFilePaths) {
      notes.push(new Note(filePath, onNoteCreatedEmitter));
    }

    // Process notes once all created
    for (const note of notes) {
      linkManager.replaceWikiLinks(note);
    }

    // Prepare destination directory
    prepareDestDirectory(blogDir);
  }
}
