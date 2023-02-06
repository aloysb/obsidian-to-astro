import {
   beforeEach,
   describe,
   it,
} from "https://deno.land/std@0.175.0/testing/bdd.ts";

import { Emitter } from "../lib/eventEmitter.ts";
import { LinkManager } from "../lib/linkManager.ts";
import { Note } from "../lib/note.ts";
import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";
import { findFilesRecursively } from "../lib/utils.ts";

describe("linkManager", () => {
   let linkManager: LinkManager;
   const onNoteCreatedEmitter = new Emitter<Note>();

   beforeEach(async () => {
      linkManager = new LinkManager();
      onNoteCreatedEmitter.on(linkManager.registerNote.bind(linkManager));
      for (const filePath of await findFilesRecursively("test/_testFolder")) {
         new Note(filePath, [], onNoteCreatedEmitter);
      }
   });

   it("record new notes", () => {
      assertEquals(linkManager.notes.length, 5);
   });
});
