import {
  afterEach,
  assertEquals,
  beforeEach,
  describe,
  it,
  join,
} from "../deps.ts";
import {
  findFilesRecursively,
  prepareBackups,
  prepareDestDirectory,
  publishNotes,
} from "../lib/utils.ts";

import { Emitter } from "../lib/eventEmitter.ts";
import { LinkManager } from "../lib/linkManager.ts";
import { Note } from "../lib/note.ts";
import { setupTestDirectories } from "./test-utils.ts";

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

describe("publishNotes", () => {
  it("should copy the note across to the destination directory", async () => {
    // Arrange
    const linkManager = new LinkManager();
    const { directories, destroy } = await setupTestDirectories();
    const notePaths = await findFilesRecursively(directories.sourceDir);

    const notes = notePaths.map((path) =>
      Note.new(path, new Emitter(), linkManager)
    )
      .filter((note) => Boolean(note)) as Note[];

    // Act
    publishNotes(notes, directories.blogDir);

    // Assert
    assertEquals(
      (await findFilesRecursively(directories.blogDir)).length,
      (await findFilesRecursively(directories.sourceDir, { match: /\.md/ }))
        .length - 1, // There is one file that does not have frontmatter
    );

    // Cleanup
    destroy();
  });

  //TODO: fixme
//   it("should update the frontmatter in the source notes", async () => {
//     // Arrange
//     const linkManager = new LinkManager();
//     const { directories, destroy } = await setupTestDirectories();
//     const notePaths = await findFilesRecursively(directories.sourceDir);

//     const notes = notePaths.map((path) =>
//       Note.new(path, new Emitter(), linkManager)
//     )
//       .filter((note) => Boolean(note)) as Note[];

//     // Act
//     publishNotes(notes, directories.blogDir);

//     // Assert
//     // The frontmatter of the notes are updated to include the published date
//     notes.forEach((note) => {
//       assertEquals(note.frontmatter.status, "publish");
//       assertEquals(note.frontmatter.published_at, new Date());
//     });

//     // Cleanup
//     destroy();
//   });
});
