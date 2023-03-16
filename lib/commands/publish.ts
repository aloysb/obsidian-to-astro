import { createBackup, prepareDestDirectory, publishToGit } from "../utils.ts";

import { Command } from "../Cli.ts";
import { Config } from "../Config.ts";
import { NotesManager } from "../NotesManager.ts";
import { logger } from "../../deps.ts";

/**
 * Publish command
 * Publishes the notes to the blog directory
 */
export class PublishCommand implements Command<never> {
   public async execute(config: Config) {
      const { backupDir, blogDir, sourceDir } = config;

      // Ask for confirmation before proceeding
      const shouldProceed = confirm(`Using the following directories:
    - Blog: ${blogDir},
    - Vault: ${sourceDir},
    - Backup: ${backupDir}
    Do you want to proceed?
`);

      if (!shouldProceed) {
         console.log("Cancelling");
         return;
      }

      // Prepare backup directory
      try {
         createBackup(sourceDir, blogDir, backupDir);
      } catch (e) {
         logger.error(e);
         Deno.exit(1);
         return;
      }
      // Prepare destination directory
      prepareDestDirectory(blogDir);

      const notesManager = await NotesManager.initialize({ config, logger });
      notesManager.publishNotes();

      try {
         // await publishToGit(blogDir);
      } catch (e) {
         logger.error("Error publishing to git", e);
         Deno.exit(1);
      }
   }
}
