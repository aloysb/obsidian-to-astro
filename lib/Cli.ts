import { HelpCommand } from "./commands/help.ts";
import { InitalizeConfigCommand } from "./commands/initializeConfig.ts";
import { PublishCommand } from "./commands/publish.ts";
import { parse } from "../deps.ts";

export interface Command<T> {
  execute(arg: T): void;
}

/*
 * Class representing the CLI
 * The Cli class is the entry point of the program.
 * It handles the command line arguments and execute the right command.
 * It is a singleton and can be initialized only once.
 */
export class Cli {
  /*
   * Static methods
   */

  /**
   * handleCommand handles the command line arguments and execute the right command
   */
  public static async HandleCommand(args?: typeof Deno.args) {
    const flags = parse(args ?? ["--help"], {
      boolean: ["help", "publish"],
      string: ["source", "blog"],
      alias: { ["help"]: "h" },
    });

    const hasNoArgs = Object.values(flags).every((flag) => {
      return flag === false || (flag as string[]).length === 0 || flag === "";
    });

    if (flags.help || hasNoArgs) {
       new HelpCommand().execute();
       Deno.exit(0);
    }

    if (flags.publish) {
       try {
          const config = await new InitalizeConfigCommand().execute(flags);
          await new PublishCommand().execute(config);
       } catch (e) {
          console.error(e);
       }
    }
  }
}
