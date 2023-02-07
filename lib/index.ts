import * as logger from "https://deno.land/std@0.177.0/log/mod.ts";
import { join } from "https://deno.land/std@0.177.0/path/mod.ts";
import { BLOG_DIR, VAULT_DIR } from "./config.ts";

import { Emitter } from "./eventEmitter.ts";
import { LinkManager } from "./linkManager.ts";
import { Note } from "./note.ts";
import {
  findFilesRecursively,
  prepareBackups,
  prepareDestDirectory,
} from "./utils.ts";

async function main() {
  confirm(`Using the following directories:
    - Blog: ${BLOG_DIR},
    - Vault: ${VAULT_DIR},
    Do you want to proceed?
`);

  try {
    prepareBackups(
      VAULT_DIR,
      BLOG_DIR,
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
  const noteFilePaths = await findFilesRecursively(VAULT_DIR, {
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
  prepareDestDirectory(BLOG_DIR);
}

await main();

//   try {
//     Deno.removeSync(path.join(BLOG_DIR), { recursive: true });
//     await prepareDestDirectory();
//     const notes = await getAllProcessedNotes(VAULT_DIR);
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
//       return Deno.writeTextFile(path.join(BLOG_DIR, note.title), note.publish);
//     }),
//   );
// }
