import {
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.173.0/testing/bdd.ts";

import { Note } from "./note.ts";
import { assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts";

describe("Note class", () => {
  let note: Note;
  const filePath = "./_testFolder/note1.md";
  const filePathWithoutFrontmatter = "./_testFolder/noteWithoutFrontmatter.md";
  const fileContent = Deno.readTextFileSync(filePath);
  beforeEach(() => {
    note = new Note(filePath);
  });
  it("should instantiate a Note object from a file path", () => {
    assertEquals(note.filePath, filePath);
    assertEquals(note.rawFile, fileContent);
  });

  it("should let me obtain the frontmatter", () => {
     const expected = {
        title: 'hello world',
        created_at: new Date('2023-01-01 12:00'),
        last_modified_at: new Date("2023-01-01 18:00"),
        slug: "hello-world",
        status: "publish",
        tags: [
           "hello",
           "world",
        ],
     };
    assertEquals(expected, note.frontmatter);
  });

  it("should return null if there is no frontmatter", () => {
    const noteWithoutFrontMatter = new Note(filePathWithoutFrontmatter);
    const expected = null;
    noteWithoutFrontMatter.frontmatter === expected;
  });

  it("should let me obtain the note content", () => {
    const expected = "hello world";
    assertEquals(note.content, expected);
  });
});
