import {
   beforeEach,
   describe,
   it,
} from "https://deno.land/std@0.175.0/testing/bdd.ts";

import { LinkManager } from "../lib/linkManager.ts";
import { Note } from "../lib/note.ts";
import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";
import { findFilesRecursively } from "../lib/utils.ts";

describe("linkManager", () => {
   let linkManager: LinkManager;

   beforeEach(async () => {
      linkManager = new LinkManager();
      for (const filePath of await findFilesRecursively("test/_testFolder")) {
         new Note(filePath, [], [linkManager.registerNote.bind(linkManager)]);
      }
   });

   it("record new notes", () => {
      assertEquals(linkManager.notes.length, 5);
   });
});
