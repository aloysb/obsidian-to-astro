import { Cli, missingArgument } from "../lib/cli.ts";
import {
  afterEach,
  assertEquals,
  assertSpyCall,
  assertSpyCallArgs,
  beforeEach,
  describe,
  it,
  returnsNext,
  Spy,
  spy,
  Stub,
  stub,
} from "./deps.ts";

import { Config } from "../lib/config.ts";
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
  });

  it("displays a help/welcome message by default", () => {
    Cli.handleCommand(undefined);
    assertSpyCallArgs(consoleSpy, 0, [welcomeMessage]);
  });

  it("displays the welcome/help message if the help flag is set to true", () => {
    Cli.handleCommand(["--help"]);
    assertSpyCallArgs(consoleSpy, 0, [welcomeMessage]);
  });
  it("displays the welcome/help message if the help flag alias (-h) is set to true", () => {
    Cli.handleCommand(["-h"]);
    assertSpyCallArgs(consoleSpy, 0, [welcomeMessage]);
  })
  it("should run the configuration in manual mode if a source and a destination directories are provided", () => {
    const promptStub = stub(window, "confirm", () => false);
    const SOURCE = "/my/path/source";
    const BLOG = "/my/path/blog";
    Cli.handleCommand(["--publish", "--source", SOURCE, "--blog", BLOG]);

    assertEquals(Config.retrieve().blogDir, BLOG);
    assertEquals(Config.retrieve().sourceDir, SOURCE);

    promptStub.restore();
  });
  it("should display an error message if I only provide the source", () => {
    const SOURCE = "/my/path/source";
    Cli.handleCommand(["--publish", "--source", SOURCE]);
    assertSpyCallArgs(consoleSpy, 0, [missingArgument]); //  assertSpyCallArgs(consoleSpy, 1, [missingArgument]);
  });

  it("should display an error message if I only provide the destination (blog", () => {
    const BLOG = "/my/path/blog";
    Cli.handleCommand(["--publish", "--blog", BLOG]);
    assertSpyCallArgs(consoleSpy, 0, [missingArgument]);
  });
  it("should runs the configuration in integrated mode if neither the source of the blog path are provided", () => {
    const initializeSpy = spy(Config, "initialize");
    const promptStub = stub(window, "confirm", () => false);
    Cli.handleCommand(["--publish"]);
    // @ts-ignore: I can't figure out the Spy generic
    assertSpyCall(initializeSpy, 0, [{ type: "integrated" }]);
    initializeSpy.restore();
    promptStub.restore();
  });
});
