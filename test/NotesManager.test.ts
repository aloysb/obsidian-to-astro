import { assertEquals, beforeEach, describe, it, logger } from "../deps.ts";

import { Config } from "../lib/Config.ts";
import { NotesManager } from "../lib/NotesManager.ts";
import { findFilesRecursively } from "../lib/utils.ts";
import { setupTestDirectories } from "./test-utils.ts";

describe("NotesManager", () => {
  let config: Config;
  beforeEach(async () => {
    const { directories } = await setupTestDirectories();
    config = await Config.initialize({
       type: "cli",
       values: {
          sourceDir: directories.sourceDir,
          blogDir: directories.blogDir,
          backupDir: directories.backupDir,
       },
    });
  });

  it("should allow to create all notes", async () => {
     const notesManager = await NotesManager.initialize({ config });
     const expectedFiles = await findFilesRecursively(config.sourceDir, {
        match: /.*\.md/,
     });
     assertEquals(notesManager.notes.length, expectedFiles.length - 1); // There is one file that does not have frontmatter
  });

  it("should copy the note across to the destination directory", async () => {
     // Arrange
     const notesManager = await NotesManager.initialize({ config });

     // Act
     notesManager.publishNotes();

     // Assert
     const files = await findFilesRecursively(config.sourceDir, {
        match: /.*\.md/,
     });
     const expectedFiles = await findFilesRecursively(config.blogDir, {
        match: /.*\.md/,
     });
     assertEquals(
        files.length - 1, // There is one file that does not have frontmatter,
        expectedFiles.length,
        `The number of files in the source directory ${files.length} is not the same as the number of files in the destination directory ${expectedFiles.length}`
     );
  });
});
