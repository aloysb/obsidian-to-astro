import { Cli, welcomeMessage } from "../lib/cli.ts";
import {
   assertSpyCall,
   assertSpyCallArgs,
   assertSpyCalls,
   spy,
} from "https://deno.land/std@0.173.0/testing/mock.ts";
import {
   beforeEach,
   describe,
   it,
} from "https://deno.land/std@0.173.0/testing/bdd.ts";

describe("cli" ,() => {

   it("display a help/welcome message by default", () => {
      const consoleSpy = spy(console, "log")
      Cli.handleCommand(undefined);
      assertSpyCallArgs(consoleSpy, 0, [welcomeMessage])
   })
 })