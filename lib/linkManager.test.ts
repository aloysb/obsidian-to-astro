import {
   beforeEach,
   describe,
   it,
} from "https://deno.land/std@0.175.0/testing/bdd.ts";

import { LinkManager } from "./linkManager.ts";
import { Note } from "./note.ts";
import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";
import { findFilesRecursively } from "./utils.ts";

describe("linkManager", () => {
   let linkManager: LinkManager;

   const getNotes = async () => {
      const notes: Note[] = [];
      for (const filePath of await findFilesRecursively("./_testFolder")) {
         notes.push(new Note(filePath, () => {}));
      }
      return notes;
   };

   beforeEach(async () => {
      linkManager = new LinkManager(await getNotes());
   });

   it("can record all the notes", () => {
      assertEquals(linkManager.notes.length, 5);
   });
});
