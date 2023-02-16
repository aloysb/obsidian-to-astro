import { Cli } from "./cli.ts";

await main();

export async function main(args = Deno.args) {
  await Cli.handleCommand(args);
}
