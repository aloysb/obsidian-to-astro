import { parse } from "https://deno.land/std@0.175.0/flags/mod.ts";

const flags = parse(Deno.args, {
   boolean: ["help", "publish"],
   string: ["source", "blog"],
 });


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
 * The Cli class is in charge of interacting with the user.
 * It is the main entry point that will run the right command depending on the user input
 */
export class Cli{
   /**
    * handleCommand process the user command and trigger the right actions
    */
   public static handleCommand(arg?: typeof flags ){
      console.log(welcomeMessage);
   }
}
 