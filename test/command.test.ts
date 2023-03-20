import { HelpCommand, welcomeMessage } from "../lib/commands/help.ts";
import {
   Stub,
   afterEach,
   assertEquals,
   assertSpyCall,
   assertSpyCallArgs,
   beforeEach,
   describe,
   it,
   spy,
   stub,
} from "../deps.ts";
import { createBackup, findFilesRecursively } from "../lib/utils.ts";

import { Config } from "../lib/Config.ts";
import { InitalizeConfigCommand } from "../lib/commands/initializeConfig.ts";
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
        config = await Config.initialize({
           type: "cli",
           values: setup.directories,
        });
        stubExit = stub(Deno, "exit", (): never => {
           return null as never;
        });
     });

     afterEach(() => {
        stubExit.restore();
     });

     it("should do a backup", () => {
        const promptStub = stub(window, "prompt", () => "y");
        const backupSpy = spy(createBackup);
        try {
           new PublishCommand().execute(config);
           assertSpyCall(backupSpy, 1);
        } catch (_e) {
           console.log(_e);
        } finally {
           promptStub.restore();
        }
     });

     it("should copy the processed notes accross", async () => {
        const promptStub = stub(window, "prompt", () => "y");
        try {
           await new PublishCommand().execute(config);
           const blogDirResult = await findFilesRecursively(config.blogDir);
           assertEquals(blogDirResult.length, 4);
        } finally {
           promptStub.restore();
        }
     });

     it("should commit the changes to the blog directory", async () => {
        const promptStub = stub(window, "prompt", () => "y");
        try {
           await new PublishCommand().execute(config);
        } finally {
           promptStub.restore();
        }
     });
  });

  describe("initalizeConfig", () => {
     beforeEach(() => {
        Config.UNSAFE_destroy();
     });
     it("should initialize the config with the right values", async () => {
        const userArgs = {
           source: "source",
           blog: "blog",
           backup: "backup",
        };

        const config = await new InitalizeConfigCommand().execute({
           source: userArgs.source,
           blog: userArgs.blog,
           backup: userArgs.backup,
        });

        assertEquals(config.sourceDir, "source");
        assertEquals(config.blogDir, "blog");
        assertEquals(config.backupDir, "backup");
     });
  });
});
