// import * as path from "https://deno.land/std@0.171.0/path/mod.ts";

import { BLOG_DIR, VAULT_DIR } from "./config.ts";

import { LinkManager } from "./linkManager.ts";
import { Note } from "./note.ts";
import { findFilesRecursively } from "./utils.ts";

// import { Note } from "./types.ts";

// await main();

async function _main() {
  confirm(`Using the following directories:
    - Blog: ${BLOG_DIR},
    - Vault: ${VAULT_DIR},
    Do you want to proceed?
`);
  const notes = [];
  const linkManager = new LinkManager();
  const noteFilePaths = await findFilesRecursively(VAULT_DIR, {
    match: new RegExp(".*.md$"),
  });

  const onNoteCreated = [linkManager.registerNote];
  const handlers = [linkManager.replaceWikiLinks];

  // Create all notes
  for (const filePath of noteFilePaths) {
    notes.push(new Note(filePath, handlers, onNoteCreated));
  }

  // Process notes
  for (const note of notes) {
    note.process();
  }
}

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

// function prepareDestDirectory() {
//   try {
//     Deno.readDirSync(BLOG_DIR);
//     Deno.removeSync(path.join(BLOG_DIR, "*"));
//   } catch {
//     Deno.mkdirSync(BLOG_DIR, { recursive: true });
//   }
// }
