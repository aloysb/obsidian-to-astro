import {
  findFilesRecursively,
  prepareBackups,
  prepareDestDirectory,
  publishNotes,
} from "../utils.ts";

import { Command } from "../cli.ts";
import { Config } from "../config.ts";
import { Note } from "../note.ts";
import { logger } from "../../deps.ts";

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

    // Get all notes
    const noteFilePaths = await findFilesRecursively(sourceDir, {
      match: new RegExp(".*.md$"),
    });

    // Create all notes
    for (const filePath of noteFilePaths) {
      const maybeNote = Note.new(filePath);
      if (maybeNote) {
        notes.push(maybeNote as Note);
      }
    }

    // Prepare destination directory
    prepareDestDirectory(blogDir);

    // Copy notes to destination directory
    publishNotes(notes, blogDir);
  }
}
