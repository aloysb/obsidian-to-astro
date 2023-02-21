import { setupTestDirectories, TestFixtures } from "./test-utils.ts";
import { afterEach, assertEquals, beforeEach, describe, it } from "../deps.ts";

import { findFilesRecursively } from "../lib/utils.ts";

describe("Setting up the test fixtures", () => {
  let directories: TestFixtures["directories"];
  let destroy: TestFixtures["destroy"];

  beforeEach(async () => {
    const setup = await setupTestDirectories();
    directories = setup.directories;
    destroy = setup.destroy;
  });

  afterEach(() => {
    destroy();
  });

  it("should create the test directories", async () => {
    const sourcesFiles = [
      ...await findFilesRecursively("./test/__fixtures__/source"),
    ];
    const { sourceDir, blogDir, backupDir } = directories;

    assertEquals(
      (await findFilesRecursively(sourceDir)).length,
      sourcesFiles.length,
    );
    assertEquals((await findFilesRecursively(blogDir)).length, 0);
    assertEquals((await findFilesRecursively(backupDir)).length, 0);
  });
});
