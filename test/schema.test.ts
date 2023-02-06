import { assertSnapshot } from "https://deno.land/std@0.174.0/testing/snapshot.ts";
import { blogSchema } from "../lib/schema.ts";

Deno.test("the schema matches the snapshot", async function (t): Promise<void> {
   // I found it hard to test the schema without testing Zod, which I don't want to test.
   // As a compromise, I am simply testing that the schema hasn't changed inadvertently
   await assertSnapshot(t, blogSchema);
});
