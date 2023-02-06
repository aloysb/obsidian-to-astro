import { BLOG_DIR, VAULT_DIR } from "./config.ts";

import { Emitter } from "./eventEmitter.ts";
import { LinkManager } from "./linkManager.ts";
import { Note } from "./note.ts";
import { findFilesRecursively } from "./utils.ts";

async function _main() {
   confirm(`Using the following directories:
    - Blog: ${BLOG_DIR},
    - Vault: ${VAULT_DIR},
    Do you want to proceed?
`);
   const notes = [];
   const linkManager = new LinkManager();

   // Create a note created emitter
   const onNoteCreatedEmitter = new Emitter<Note>();

   // Registers handlers at note creation
   onNoteCreatedEmitter.on(linkManager.registerNote.bind(linkManager));

   // Get all notes
   const noteFilePaths = await findFilesRecursively(VAULT_DIR, {
      match: new RegExp(".*.md$"),
   });

   // Note processing pipeline
   const noteProcessHandlers = [linkManager.replaceWikiLinks.bind(linkManager)];

   // Create all notes
   for (const filePath of noteFilePaths) {
      notes.push(new Note(filePath, noteProcessHandlers, onNoteCreatedEmitter));
   }

   // Process notes once all created
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
