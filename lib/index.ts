// import * as path from "https://deno.land/std@0.171.0/path/mod.ts";

// import { BLOG_DIR, VAULT_DIR } from "./config.ts";

// import { Note } from "./types.ts";

// await main();

// async function main() {
//   confirm(`Using the following directories:
//     - Blog: ${BLOG_DIR},
//     - Vault: ${VAULT_DIR},
//     Do you want to proceed?
// `);

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