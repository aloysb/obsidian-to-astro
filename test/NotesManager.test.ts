import {
  afterEach,
  assertEquals,
  beforeEach,
  describe,
  it,
  logger,
} from "../deps.ts";

import { Config } from "../lib/config.ts";
import { NotesManager } from "../lib/NotesManager.ts";
import { setupTestDirectories } from "./test-utils.ts";

describe("linkManager", () => {
  let destroy: () => void;
  let config: Config;
  beforeEach(async () => {
    const { destroy: destroyHandle, directories } =
      await setupTestDirectories();
    config = Config.initialize({
      type: "cli",
      values: {
        sourceDir: directories.sourceDir,
        blogDir: directories.blogDir,
        backupDir: directories.backupDir,
      },
    });
    destroy = destroyHandle;
  });
  afterEach(() => {
    destroy();
  });
  it("should allow to create all notes", async () => {
    const notesManager = await NotesManager.initialize({ config, logger });
    assertEquals(notesManager.notes.length, 5);
  });
});
