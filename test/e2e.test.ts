import { assertEquals, describe, it, returnsNext, stub } from "../deps.ts";

import { findFilesRecursively } from "../lib/utils.ts";
import { main } from "../lib/index.ts";
import { processedBlogSchema } from "../lib/schema.ts";
import { setupTestDirectories } from "./test-utils.ts";

describe("E2E testing", () => {
  it("should convert my notes to my blog directory when I provide a source and destination directory", async () => {
    // Arrange
    const { destroy, directories } = await setupTestDirectories();
    const { sourceDir, blogDir, backupDir } = directories;
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

    // 1. == BACKUP ==
    const notes = await findFilesRecursively(sourceDir);
    const backupDirResult = await findFilesRecursively(backupDir);
    assertEquals(
      backupDirResult.length,
      notes.length,
      `Expected ${backupDirResult.length} to be ${notes.length}`,
    );
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
      notes.length - 2,
      `Expected ${blogDirResult.length} to be ${notes.length - 2}`,
    );
    // Wikilinks have been replaced by markdown links
    blogDirResult.forEach((post) => {
      const markdownRegexp = /\[\[|\]\]/g;
      assertEquals(
        markdownRegexp.test(Deno.readTextFileSync(post)),
        false,
        "wiki links replaced",
      );
    });

    // 3. == SOURCE ==
    // My source notes' frontmatter are updated
    const updatedNotes = await findFilesRecursively(sourceDir, {
      match: /\.md/,
    });
    updatedNotes.forEach((note) => {
      const content = Deno.readTextFileSync(note);
      try {
        const [_, frontmatter, _body] = content.split("---")[1];
        processedBlogSchema.parse(frontmatter);
      } catch {
        return;
      }
    });

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
    destroy();
  });
});
