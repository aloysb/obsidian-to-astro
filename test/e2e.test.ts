import { assertEquals, describe, it, returnsNext, stub } from "../deps.ts";

import { findFilesRecursively } from "../lib/utils.ts";
import { main } from "../lib/index.ts";

describe("E2E testing", () => {
  it("should convert my notes to my blog directory when I provide a source and destination directory", async () => {
    // Arrange
    const sourceDir = "./test/__fixtures__/source";
    const blogDir = Deno.makeTempDirSync();
    //  const loggerDir = Deno.makeTempDirSync();
    const backupDir = Deno.makeTempDirSync();

    stub(window, "confirm", returnsNext([true]));
    stub(window, "prompt", returnsNext([sourceDir, blogDir]));

    // Act
    // Replace by the cli
    await main([
      "--publish",
      `--source=${sourceDir}`,
      `--blog=${blogDir}`,
      `--backup=${backupDir}`,
    ]);

    // Assert
    const notes = await findFilesRecursively(sourceDir);
    const notesCount = notes.length;

    // 1. == BACKUP ==
    // A backup has been created
    const backupDirResult = await findFilesRecursively(backupDir);
    assertEquals(backupDirResult.length, notesCount, "Backup created");
    // The content of the backupDir is the same as the sourceDir
    const originalNotesNames = notes.map((note) => note.split("/").pop());
    const backupNotesNames = backupDirResult.map((note) =>
      note.split("/").pop()
    );
    assertEquals(
      originalNotesNames.sort(),
      backupNotesNames.sort(),
      "Backup content",
    );

    // 2. == BLOG ==
    // My notes are in the destination directory and processed
    const blogDirResult = await findFilesRecursively(blogDir);
    assertEquals(
      blogDirResult.length,
      notesCount - 2,
      "Notes in blog directory created",
    );
    // Wikilinks have been replaced by markdown links
    console.log(blogDirResult);
    blogDirResult.forEach((post) => {
      console.log("post", post);
      const markdownRegexp = /\[\[|\]\]/g;
      assertEquals(markdownRegexp.test(Deno.readTextFileSync(post)), false);
    });

    // 3. == SOURCE ==
    // My source notes' frontmatter are updated
    //TODO check the content of the files

    // 4. == LOGGER ==
    // The logger is created
    //     const loggerDirResult = await findFilesRecursively(loggerDir);
    //     assertEquals(loggerDirResult.length, 1);
    //     const logger = loggerDirResult[0];
    //     // The logger filename contains the date of the day
    //     assertEquals(logger[0], new Date().toISOString().split("T")[0]);

    //     // Cleanup
    //     for (const directory in [blogDir, loggerDir, backupDir]) {
    //       Deno.removeSync(directory, { recursive: true });
    //     }
  });
});
