import { assertEquals, beforeEach, describe, it } from "./deps.ts";

import { NotesManager } from "../lib/NotesManager.ts";

describe("linkManager", () => {
  beforeEach(() => {
    setup;
  });
  it("should allow to create all notes", () => {
    const notesManager = new NotesManager();
    assertEquals(notesManager.notes.length, 5);
  });
});
