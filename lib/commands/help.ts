import { Command } from "../Cli.ts";

export const welcomeMessage = `
    Hey there! 
    This is how you use this tool:
    
    [Integrated mode]: we handle the configuration for you.
    Simply run: 'vault2blog publish'

    [CLI mode]: you provide us with the source directory (your Obsidian vault) and your blog directory ("/my/astro/site/src/content/)
    'vault2blog publish --source='/my/source/path' --blog='/my/blog/path'
    
    ☝️ Note that in CLI mode, you must provide both the source and the blog paths!

    Thank you!
    Alo.
  `;

/**
 * Help command
 * Display the help message
 */
export class HelpCommand implements Command<never> {
  public execute() {
    console.log(welcomeMessage);
  }
}
