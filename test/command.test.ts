import { HelpCommand, welcomeMessage } from "../lib/commands/help.ts";
import { assertSpyCallArgs, describe, it, spy } from "./deps.ts";

describe("CLI commands", () => {
  describe("help", () => {
    it("should display the help message and exit without issue", () => {
      const consoleSpy = spy(console, "log");
      new HelpCommand().execute();
      assertSpyCallArgs(consoleSpy, 0, [welcomeMessage]);
      consoleSpy.restore();
    });
  });
});
