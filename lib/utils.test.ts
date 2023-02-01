import { describe, it } from "https://deno.land/std@0.171.0/testing/bdd.ts";

import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";
import { findFilesRecursively } from "./utils.ts";

// import { Note } from "./types.ts";

describe("Retrieveing the notes", () => {
   it("retrieves the notes recursively within a directory", async () => {
      const files = await findFilesRecursively("./_testFolder");
      assertEquals(files.length, 5);
   });

   it("can take a regexp as an option and filter the files based on whether or not they match the regexp", async () => {
      const markdownRegexp = /.*\.md/;
      const files = await findFilesRecursively("./_testFolder", {
         match: markdownRegexp,
      });
      assertEquals(files.length, 4);
   });
});

// Deno.test("replaceWikiLinks", async (t) => {
//     await t.step("It replaces the wiki links by markdown link if the file exists", async () => {
//         const notes: Note[] = [
//             {
//                 filePath: './hello.md',
//                 title: 'hello',
//                 content: `
//                 #hello world.

//                 Source: [[Fancy Note|Link to my fancy note]]
//                 `,
//                 frontmatter: {
//                     title: 'Hello',
//                     slug: 'hello',
//                     created_at: new Date(),
//                     last_modified_at: new Date(),
//                     tags: [],
//                     draft: false

//                 }
//             },
//             {
//                 filePath: './Fancy Note.md',
//                 title: 'Fancy Note',
//                 content: `
//                 # My fancy note!

//                 **Fancy** !
//                 `,
//                 frontmatter: {
//                     title: 'Fancy Note',
//                     slug: 'fancy-note',
//                     created_at: new Date(),
//                     last_modified_at: new Date(),
//                     tags: [],
//                     draft: false
//                 }
//             },
//         ]
//         const processedNotes = await replaceWikilinks(notes)
//         const helloNote = processedNotes.find(({ title }) => title === notes[0].title)
//         assertExists(helloNote)
//         const match = '[Link to my fancy note](../fancy-note.md)'
//         assertStringIncludes(helloNote.content, match)
//     })

//     await t.step("It replaces the wiki links by markdown link if the file exists", async () => {
//         const notes: Note[] = [
//             {
//                 filePath: './hello.md',
//                 title: 'hello',
//                 content: `
//                 #hello world.

//                 Source: [[Ugly Note|Link to my ugly note]]
//                 `,
//                 frontmatter: {
//                     title: 'Hello',
//                     slug: 'hello',
//                     created_at: new Date(),
//                     last_modified_at: new Date(),
//                     tags: [],
//                     draft: false

//                 }
//             },
//             {
//                 filePath: './Fancy Note.md',
//                 title: 'Fancy Note',
//                 content: `
//                 # My fancy note!

//                 **Fancy** !
//                 `,
//                 frontmatter: {
//                     title: 'Fancy Note',
//                     slug: 'fancy-note',
//                     created_at: new Date(),
//                     last_modified_at: new Date(),
//                     tags: [],
//                     draft: false
//                 }
//             },
//         ]
//         const processedNotes = await replaceWikilinks(notes)
//         const helloNote = processedNotes.find(({ title }) => title === notes[0].title)
//         assertExists(helloNote)
//         const regexp = /\[Link to my ugly note\]\(\.\.\/ugly-note.md\)/
//         assertEquals(regexp.test(helloNote.content), false)
//         assertStringIncludes(helloNote.content, 'Link to my ugly note');
//     })

// })