import { Cli } from "./Cli.ts";

await main();

/*
 * Main function
 */
export async function main(args = Deno.args) {
  await Cli.handleCommand(args);
}
