import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts";
import { assertSnapshot } from "https://deno.land/std@0.174.0/testing/snapshot.ts";
import { describe, it } from "https://deno.land/std@0.177.0/testing/bdd.ts";
import {
  returnsNext,
  stub,
} from "https://deno.land/std@0.177.0/testing/mock.ts";
import { main } from "../lib/index.ts";
import { findFilesRecursively } from "../lib/utils.ts";
// I can run the application with a source and dir, and it will convert my notes

describe("E2E testing", () => {
  it("should convert my notes to my blog directory when I provide a source and destination directory", async (t) => {
    const sourceDir = "./_testFolder";
    const blogDir = Deno.makeTempDirSync();
    stub(window, "confirm", returnsNext([true]));
    stub(window, "prompt", returnsNext([sourceDir, blogDir]));
    await main();

    const notes = await findFilesRecursively(blogDir, { match: /\*.md/i });

    assertEquals(notes.length);
    for (const note of notes) {
      const text = Deno.readTextFileSync(note);
      assertSnapshot(t, text);
    }

    // Deno.removeSync(blogDir, { recursive: true });
  });
});
