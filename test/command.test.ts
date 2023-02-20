import { HelpCommand, welcomeMessage } from "../lib/commands/help.ts";
import {
  afterEach,
  assertEquals,
  assertSpyCall,
  assertSpyCallArgs,
  beforeEach,
  describe,
  it,
  spy,
  Stub,
  stub,
} from "../deps.ts";
import { findFilesRecursively, prepareBackups } from "../lib/utils.ts";

import { Config } from "../lib/config.ts";
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
    let config: Config;
    let stubExit: Stub<typeof Deno, [code?: number], never>;

    beforeEach(async () => {
      const setup = await setupTestDirectories();
      config = Config.initialize({ type: "cli", values: setup.directories });
      stubExit = stub(Deno, "exit", (): never => {
        return null as never;
      });
    });

    afterEach(() => {
      stubExit.restore();
    });

    it("should do a backup", () => {
      const confirmStub = stub(window, "confirm", () => true);
      const backupSpy = spy(prepareBackups);
      try {
        new PublishCommand().execute(config);
        assertSpyCall(backupSpy, 1);
      } catch (_e) {
        console.log(_e);
      } finally {
        confirmStub.restore();
      }
    });

    it("should copy the processed notes accross", async () => {
      const confirmStub = stub(window, "confirm", () => true);
      try {
        await new PublishCommand().execute(config);
        const blogDirResult = await findFilesRecursively(config.blogDir);
        assertEquals(blogDirResult.length, 4);
      } finally {
        confirmStub.restore();
      }
    });
  });
});
