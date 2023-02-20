import {
  prepareBackups,
  prepareDestDirectory,
  publishNotes,
} from "../utils.ts";

import { Command } from "../cli.ts";
import { Config } from "../config.ts";
import { NotesManager } from "../NotesManager.ts";
import { logger } from "../../deps.ts";

export class PublishCommand implements Command<never> {
  public async execute(config: Config) {
    const { backupDir, blogDir, sourceDir } = config;
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

    const notesManager = await NotesManager.initialize({ config, logger });

    // Prepare destination directory
    prepareDestDirectory(blogDir);

    // Copy notes to destination directory
    publishNotes(notesManager.notes, blogDir);
  }
}
