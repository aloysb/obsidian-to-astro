import { assertEquals, beforeEach, describe, it } from "../deps.ts";

import { Emitter } from "../lib/eventEmitter.ts";
import { LinkManager } from "../lib/linkManager.ts";
import { Note } from "../lib/note.ts";
import { findFilesRecursively } from "../lib/utils.ts";

describe("linkManager", () => {
  let linkManager: LinkManager;
  const onNoteCreatedEmitter = new Emitter<Note>();

  beforeEach(async () => {
    linkManager = new LinkManager();
    onNoteCreatedEmitter.on(linkManager.registerNote.bind(linkManager));
    for (
      const filePath of await findFilesRecursively("test/__fixtures__/source", {
        match: /.*\.md/,
      })
    ) {
      new Note(filePath, onNoteCreatedEmitter, linkManager);
    }
  });

  it("record new notes", () => {
    assertEquals(linkManager.notes.length, 5);
  });
});
