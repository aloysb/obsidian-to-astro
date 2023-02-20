import { HelpCommand, welcomeMessage } from "../lib/commands/help.ts";
import {
  afterEach,
  assertSpyCall,
  assertSpyCallArgs,
  beforeEach,
  describe,
  it,
  spy,
  stub,
} from "../deps.ts";

import { Config } from "../lib/config.ts";
import { PublishCommand } from "../lib/commands/publish.ts";
import { prepareBackups } from "../lib/utils.ts";
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
    let destroy: () => void;
    let config: Config;

    beforeEach(async () => {
      const setup = await setupTestDirectories();
      console.error("HERE")
      let a = Deno.readDirSync(setup.directories.sourceDir);
      for (const e of a ){
      console.log(e.name)
      }

      destroy = setup.destroy;
      config = Config.initialize({ type: "cli", values: setup.directories });
      stub(Deno, "exit", (): never => {
        return null as never;
      });
    });


    it("should do a backup", () => {
      const confirmStub = stub(window, "confirm", () => true);
      const backupSpy = spy(prepareBackups);
      console.log(config)
      try {
        new PublishCommand().execute(config);
        assertSpyCall(backupSpy, 1);
      } catch (_e) {
        console.log(_e)
        confirmStub.restore();
      }
    });

   //  it("should copy the processed notes accross", async () => {
   //    const confirmStub = stub(window, "confirm", () => true);
   //    try {
   //      await new PublishCommand().execute(config);
   //      const blogDirResult = await findFilesRecursively(config.blogDir);
   //      assertEquals(blogDirResult.length, 4);
   //    } finally {
   //       console.error('here')
   //      confirmStub.restore();
   //    }
   //  });
  });
});
