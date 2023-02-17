import { HelpCommand, welcomeMessage } from "../lib/commands/help.ts";
import {
  assertEquals,
  assertSpyCall,
  assertSpyCallArgs,
  beforeAll,
  describe,
  it,
  spy,
  stub,
} from "../deps.ts";
import { findFilesRecursively, prepareBackups } from "../lib/utils.ts";

import { PublishCommand } from "../lib/commands/publish.ts";
import { setupTestDirectories } from "./test-utils.ts";

describe("CLI commands", () => {
  describe("help", () => {
    it("should display the help message and exit without issue", () => {
      const consoleSpy = spy(console, "log");
      new HelpCommand().execute();
      assertSpyCallArgs(consoleSpy, 0, [welcomeMessage]);
      consoleSpy.restore();
    });
  });

  describe("publish", () => {
    beforeAll(() => {
      stub(Deno, "exit", (): never => {
        return null as never;
      });
    });
    it("should do a backup", () => {
      const confirmStub = stub(window, "confirm", () => true);
      const backupDir = Deno.makeTempDirSync();
      try {
        const backupSpy = spy(prepareBackups);
        const sourceDir = "my/path/to/source";
        const blogDir = "my/path/to/blog";
        new PublishCommand().execute({ sourceDir, blogDir, backupDir });
        assertSpyCall(backupSpy, 1);
      } catch (_e) {
        /* Do nothing */
        confirmStub.restore();
      } finally {
        Deno.removeSync(backupDir, { recursive: true });
      }
    });

    it("should copy the processed notes accross", async () => {
      const confirmStub = stub(window, "confirm", () => true);
      const { directories, destroy } = await setupTestDirectories();
      try {
        await new PublishCommand().execute(directories);
        const blogDirResult = await findFilesRecursively(directories.blogDir);
        assertEquals(blogDirResult.length, 4);
      } finally {
        destroy();
        confirmStub.restore();
      }
    });
  });
});
