import {
   Spy,
   Stub,
   afterEach,
   assertEquals,
   assertSpyCall,
   assertSpyCallArgs,
   beforeEach,
   describe,
   it,
   returnsNext,
   spy,
   stub,
} from "../deps.ts";

import { Cli } from "../lib/Cli.ts";
import { Config } from "../lib/Config.ts";
import { missingArgument } from "../lib/commands/initializeConfig.ts";
import { setupTestDirectories } from "./test-utils.ts";
import { welcomeMessage } from "../lib/commands/help.ts";

describe("cli", () => {
   let consoleSpy: Spy<Console>;
   let exitStub: Stub<typeof Deno, [code?: number | undefined], never>;
   beforeEach(() => {
      Deno.env.set("ENV_MODE", "TEST");
      exitStub = stub(Deno, "exit", returnsNext(new Array<never>(30)));
      consoleSpy = spy(console, "log");
   });
   afterEach(() => {
      consoleSpy.restore();
      exitStub.restore();
      Config.UNSAFE_destroy();
   });

   it("displays a help/welcome message by default", () => {
      Cli.HandleCommand(undefined);
      assertSpyCallArgs(consoleSpy, 0, [welcomeMessage]);
   });

   it("displays the welcome/help message if the help flag is set to true", () => {
      Cli.HandleCommand(["--help"]);
      assertSpyCallArgs(consoleSpy, 0, [welcomeMessage]);
   });
   it("displays the welcome/help message if the help flag alias (-h) is set to true", () => {
      Cli.HandleCommand(["-h"]);
      assertSpyCallArgs(consoleSpy, 0, [welcomeMessage]);
   });
   it("should run the configuration in manual mode if a source and a destination directories are provided", async () => {
      const { directories, destroy } = await setupTestDirectories();
      const SOURCE = directories.sourceDir;
      const BLOG = directories.blogDir;
      const promptStub = stub(window, "prompt", returnsNext(["y", "y"]));

      await Cli.HandleCommand([
         "--publish",
         "--source",
         SOURCE,
         "--blog",
         BLOG,
      ]);

      await promptStub.restore();
      assertEquals(Config.retrieve().blogDir, BLOG);
      assertEquals(Config.retrieve().sourceDir, SOURCE);

      await destroy();
   });
   it("should display an error message if I only provide the source", () => {
      const SOURCE = "/my/path/source";
      Cli.HandleCommand(["--publish", "--source", SOURCE]);
      assertSpyCallArgs(consoleSpy, 0, [missingArgument]); //  assertSpyCallArgs(consoleSpy, 1, [missingArgument]);
   });

   it("should display an error message if I only provide the destination (blog", () => {
      const BLOG = "/my/path/blog";
      Cli.HandleCommand(["--publish", "--blog", BLOG]);
      assertSpyCallArgs(consoleSpy, 0, [missingArgument]);
   });
   it("should runs the configuration in integrated mode if neither the source of the blog path are provided", async () => {
      const { directories, destroy } = await setupTestDirectories();
      stub(
         window,
         "prompt",
         returnsNext([directories.sourceDir, directories.blogDir, "y"])
      );
      const initializeSpy = spy(Config, "initialize");
      await Cli.HandleCommand(["--publish"]);
      // @ts-ignore: I can't figure out the Spy generic
      assertSpyCall(initializeSpy, 0, [{ type: "integrated" }]);
      initializeSpy.restore();
      destroy();
   });
});
