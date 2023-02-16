import {
  findFilesRecursively,
  prepareBackups,
  prepareDestDirectory,
  publishNotes,
} from "../utils.ts";

import { Command } from "../cli.ts";
import { Config } from "../config.ts";
import { Emitter } from "../eventEmitter.ts";
import { LinkManager } from "../linkManager.ts";
import { Note } from "../note.ts";
import { logger } from "../deps.ts";

export class PublishCommand implements Command<never> {
  public async execute(
    { sourceDir, blogDir, backupDir }: Pick<
      ReturnType<typeof Config.retrieve>,
      "blogDir" | "sourceDir" | "backupDir"
    >,
  ) {
    const shouldProceed = confirm(`Using the following directories:
    - Blog: ${blogDir},
    - Vault: ${sourceDir},
    - Backup: ${backupDir}
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
        backupDir,
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
      notes.push(new Note(filePath, onNoteCreatedEmitter, linkManager));
    }

    // Prepare destination directory
    prepareDestDirectory(blogDir);
    console.log("HERE")

    // Copy notes to destination directory
    publishNotes(notes, blogDir);
  }
}
