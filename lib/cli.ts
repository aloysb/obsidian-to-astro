import {
  findFilesRecursively,
  prepareBackups,
  prepareDestDirectory,
} from "./utils.ts";

import { Config } from "./config.ts";
import { Emitter } from "./eventEmitter.ts";
import { LinkManager } from "./linkManager.ts";
import { Note } from "./note.ts";
import { join, logger, parse } from "./deps.ts";
import { HelpCommand } from "./commands/help.ts";

export interface Command<T> {
  execute(arg: T): void;
}
export const missingArgument = `
   It looks like you have set the --source OR --blog argument, but not both.
   If you wish to use the manual mode, you must provide both.
  `;

/**
 * The Cli class is in charge of interacting with the user.
 * It is the main entry point that will run the right command depending on the user input
 */
export class Cli {
  // deno-lint-ignore no-explicit-any
  flags: any;

  private constructor() {
  }
  /**
   * handleCommand process the user command and trigger the right actions
   */
  public static async handleCommand(args?: typeof Deno.args) {
    const self = new Cli();

    self.flags = parse(args ?? ['--help'], {
      boolean: ["help", "publish"],
      string: ["source", "blog"],
      alias: {['help']:'h'}
    })

    console.error(args)
    console.error((self.flags))

    if (self.flags.help || self.flags.length === 0) {
      new HelpCommand().execute();
      Deno.exit(0);
    }

    if (self.flags.publish) {
      try {
        self.initializeConfiguration(self.flags);
        await self.publish();
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Attempt to initialize a configuration
   *
   * @param flags the parse flags
   * @returns Configuration
   */
  // deno-lint-ignore no-explicit-any
  private initializeConfiguration(flags: any) {
    if (flags.source && flags.blog) {
      Config.initialize({
        type: "cli",
        values: { sourceDir: flags.source, blogDir: flags.blog },
      });
    } else if (flags.source || flags.blog) {
      console.log(missingArgument);
      Deno.exit(1);
    } else {
      Config.initialize({ type: "integrated" });
    }

    return Config.retrieve();
  }

  /**
   * This is the MAIN function
   */
  private async publish() {
    const { sourceDir, blogDir } = Config.retrieve();
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
      throw Error(e);
    }

    const notes = [];
    const linkManager = new LinkManager();

    // Create a note created emitter
    const onNoteCreatedEmitter = new Emitter<Note>();

    // Registers handlers at note creation
    onNoteCreatedEmitter.on(linkManager.registerNote.bind(linkManager));
    onNoteCreatedEmitter.on((note) =>
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
