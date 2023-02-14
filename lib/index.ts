import { parse } from "https://deno.land/std@0.175.0/flags/mod.ts";
import * as logger from "https://deno.land/std@0.177.0/log/mod.ts";
import { join } from "https://deno.land/std@0.177.0/path/mod.ts";
import { Config } from "./config.ts";

import { Emitter } from "./eventEmitter.ts";
import { LinkManager } from "./linkManager.ts";
import { Note } from "./note.ts";
import {
  findFilesRecursively,
  prepareBackups,
  prepareDestDirectory,
} from "./utils.ts";

const flags = parse(Deno.args, {
  boolean: ["help", "publish"],
  string: ["source", "blog"],
});

if (
  Deno.args.includes("publish") ||
  flags.publish
) {
  await main();
} else {
  console.log(`
    Hey there! 
    This is how you use this tool:
    
    [Integrated mode]: we handle the configuration for you.
    Simply run: 'vault2blog publish'

    [CLI mode]: you provide us with the source directory (your Obsidian vault) and your blog directory ("/my/astro/site/src/content/)
    'vault2blog publish --source='/my/source/path' --blog='/my/blog/path'
    
    ☝️ Note that in CLI mode, you must provide both the source and the blog paths!

    Thank you!
    Alo.
  `);
}

export async function main() {
  const isIntegrated = !flags.source || !flags.blog;

  const configurationArguments = isIntegrated
    ? { type: "integrated" } as const
    : {
      type: "cli",
      values: {
        sourceDir: flags.source as string,
        blogDir: flags.blog as string,
      },
    } as const;

  const { sourceDir, blogDir } = Config.initialize(configurationArguments);

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

//   try {
//     Deno.removeSync(path.join(blogDir), { recursive: true });
//     await prepareDestDirectory();
//     const notes = await getAllProcessedNotes(sourceDir);
//     await publishNotes(
//       notes.filter(({ frontmatter }) => frontmatter.status === "publish"),
//     );
//     console.log(` ${notes.length} notes published`);
//   } catch (e) {
//     console.error("Something went wrong", e);
//   }
// }

// async function publishNotes(notes: Note[]) {
//   await Promise.all(
//     notes.map((note) => {
//       console.log(note);
//       return Deno.writeTextFile(path.join(blogDir, note.title), note.publish);
//     }),
//   );
// }
