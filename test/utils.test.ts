import {
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.171.0/testing/bdd.ts";

import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";
import { join } from "https://deno.land/std@0.177.0/path/mod.ts";
import {
  findFilesRecursively,
  prepareBackups,
  prepareDestDirectory,
} from "../lib/utils.ts";

// import { Note } from "./types.ts";

describe("Retrieveing the notes", () => {
  it("retrieves the notes recursively within a directory", async () => {
    const files = await findFilesRecursively("test/__fixtures__/source");
    assertEquals(files.length, 6);
  });

  it("can take a regexp as an option and filter the files based on whether or not they match the regexp", async () => {
    const markdownRegexp = /.*\.md/;
    const files = await findFilesRecursively("test/__fixtures__/source", {
      match: markdownRegexp,
    });
    assertEquals(files.length, 5);
  });
});

describe("Preparing the destination directory", () => {
  let tempDir: string;
  beforeEach(() => {
    tempDir = Deno.makeTempDirSync();
  });
  afterEach(() => {
    Deno.remove(tempDir, { recursive: true });
  });
  it("should remove all files from the destination directory", () => {
    Deno.createSync(join(tempDir, "foo.txt")).close();
    Deno.createSync(join(tempDir, "bar.txt")).close();
    Deno.createSync(join(tempDir, "foobar.txt")).close();
    let filesCount = [...Deno.readDirSync(tempDir)].length;
    assertEquals(filesCount, 3);

    prepareDestDirectory(tempDir);

    filesCount = [...Deno.readDirSync(tempDir)].length;
    assertEquals(filesCount, 0);
  });
});

describe("Safety features", () => {
  let sourceDir: string;
  let destinationDir: string;
  let backupDir: string;

  beforeEach(() => {
    sourceDir = Deno.makeTempDirSync();
    Deno.createSync(join(sourceDir, "foo.txt")).close();
    destinationDir = Deno.makeTempDirSync();
    Deno.createSync(join(destinationDir, "foo.txt")).close();
    backupDir = Deno.makeTempDirSync();
  });
  // Cleanup
  afterEach(() => {
    Deno.remove(sourceDir, { recursive: true });
    Deno.remove(destinationDir, { recursive: true });
    Deno.remove(backupDir, { recursive: true });
  });
  it("should create a backup of both the source and the destination directories", async () => {
    assertEquals([...Deno.readDirSync(backupDir)].length, 0);
    const uniqueBackupDir = await prepareBackups(
      sourceDir,
      destinationDir,
      backupDir,
    );

    // Main backup dir
    assertEquals([...Deno.readDirSync(backupDir)].length, 1);
    // Unique backup dir
    assertEquals([...Deno.readDirSync(uniqueBackupDir)].length, 2);
    // Destination + Source backups
    assertEquals(
      [...Deno.readDirSync(join(uniqueBackupDir, "source"))].length,
      1,
    );
    assertEquals(
      [...Deno.readDirSync(join(uniqueBackupDir, "destination"))].length,
      1,
    );
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
