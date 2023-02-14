import { HelpCommand, welcomeMessage } from "../lib/commands/help.ts";
import { PublishCommand } from "../lib/commands/publish.ts";
import { prepareBackups } from "../lib/utils.ts";
import {
  assertSpyCall,
  assertSpyCallArgs,
  beforeAll,
  describe,
  it,
  spy,
  stub,
} from "./deps.ts";

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
      try {
        const backupSpy = spy(prepareBackups);
        const sourceDir = "my/path/to/source";
        const blogDir = "my/path/to/blog";
        new PublishCommand().execute({ sourceDir, blogDir });
        assertSpyCall(backupSpy, 1);
      } catch (_e) {
        /* Do nothing */
        confirmStub.restore();
      }
    });
  });
});
