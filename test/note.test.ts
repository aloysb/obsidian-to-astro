import { assertEquals, beforeEach, describe, it } from "./deps.ts";
import { Frontmatter, Note } from "../lib/note.ts";

import { Emitter } from "../lib/eventEmitter.ts";

describe("Note class", () => {
  let note: Note;
  const filePath = "test/_testFolder/note1.md";
  const filePathWithoutFrontmatter =
    "test/_testFolder/noteWithoutFrontmatter.md";
  const fileContent = Deno.readTextFileSync(filePath);
  const onNoteCreatedEmitter = new Emitter<Note>();
  beforeEach(() => {
    note = new Note(filePath, onNoteCreatedEmitter);
  });
  it("should instantiate a Note object from a file path", () => {
    assertEquals(note.filePath, filePath);
    assertEquals(note.rawFile, fileContent);
  });

  it("should let me obtain the frontmatter", () => {
    const expected: Frontmatter = {
      title: "hello world",
      description: "",
      created_at: new Date("2023-01-01 12:00"),
      last_modified_at: new Date("2023-01-01 18:00"),
      slug: "hello-world",
      status: "publish",
      tags: ["hello", "world"],
    };
    assertEquals(expected, note.frontmatter);
  });

  it("should return null if there is no frontmatter", () => {
    const noteWithoutFrontMatter = new Note(
      filePathWithoutFrontmatter,
      onNoteCreatedEmitter,
    );
    const expected = null;
    noteWithoutFrontMatter.frontmatter === expected;
  });

  it("should let me obtain the note raw content", () => {
    // TODO fix this it should keep the \n newline
    const expected = `Hello world This wiki link does no exist [[fake link]]`;
    assertEquals(note.rawContent, expected);
  });

  it("should emit an event on note creation", () => {
    let createdNote: Note;
    // TODO fix this it should keep the \n newline
    const expected = `Hello world This wiki link does no exist [[fake link]]`;
    onNoteCreatedEmitter.on((note: Note) => {
      createdNote = note;
    });
    note = new Note(filePath, onNoteCreatedEmitter);
    // @ts-ignore: created Note is created as part of side effect
    assertEquals((createdNote as Note).filePath, filePath);
    // @ts-ignore: created Note is created as part of side effect
    assertEquals(createdNote.rawContent, expected);
  });
});
