import { Command } from "../Cli.ts";
import { Config } from "../Config.ts";

export const missingArgument = `
   It looks like you have set the --source OR --blog argument, but not both.
   If you wish to use the manual mode, you must provide both.
  `;

/**
 * Help command
 * Display the help message
 */
export class InitalizeConfigCommand implements Command<never> {
  // deno-lint-ignore no-explicit-any
  public execute(flags: any): Config {
    if (flags.source && flags.blog) {
      // If both arguments are provided, we initialize the config in CLI mode
      return Config.initialize({
        type: "cli",
        values: {
          sourceDir: flags.source,
          blogDir: flags.blog,
          backupDir: flags.backup,
        },
      });
    } else if (flags.source || flags.blog) {
      // If only one of the two arguments is provided, we exit
      console.log(missingArgument);
      Deno.exit(1);
    } else {
      // If no arguments are provided, we initialize the config in integrated mode
      return Config.initialize({ type: "integrated" });
    }
  }
}
