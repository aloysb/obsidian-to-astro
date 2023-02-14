import { HelpCommand } from "./commands/help.ts";
import { PublishCommand } from "./commands/publish.ts";
import { Config } from "./config.ts";
import { parse } from "./deps.ts";

export interface Command<T> {
  execute(arg: T): void;
}
export const missingArgument = `
   It looks like you have set the --source OR --blog argument, but not both.
   If you wish to use the manual mode, you must provide both.
  `;

/**
 * The Cli class is in charge of interacting with the user.
 * It is the main entry point that will run the right command depending on the user input
 */
export class Cli {
  private constructor() {
  }
  /**
   * handleCommand process the user command and trigger the right actions
   */
  public static async handleCommand(args?: typeof Deno.args) {
    const self = new Cli();

    const flags = parse(args ?? ["--help"], {
      boolean: ["help", "publish"],
      string: ["source", "blog"],
      alias: { ["help"]: "h" },
    });

    if (flags.help || flags.length === 0) {
      new HelpCommand().execute();
      Deno.exit(0);
    }

    if (flags.publish) {
      try {
        const config = self.initializeConfiguration(flags);
        await new PublishCommand().execute(config);
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Attempt to initialize a configuration
   *
   * @param flags the parse flags
   * @returns Configuration
   */
  // deno-lint-ignore no-explicit-any
  private initializeConfiguration(flags: any) {
    if (flags.source && flags.blog) {
      Config.initialize({
        type: "cli",
        values: { sourceDir: flags.source, blogDir: flags.blog },
      });
    } else if (flags.source || flags.blog) {
      console.log(missingArgument);
      Deno.exit(1);
    } else {
      Config.initialize({ type: "integrated" });
    }

    return Config.retrieve();
  }
}
