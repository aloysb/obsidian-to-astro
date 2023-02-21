import { Frontmatter, Note } from "../lib/Note.ts";
import {
  assertEquals,
  beforeAll,
  beforeEach,
  describe,
  it,
  stub,
} from "../deps.ts";

const NOTE_CONTENT = `Do not delete me

Hello world,

This a note to test the behavior of the application. The whole point of that
tool is to take your Obsidian note and copy them across your Astro website. But
in order to do so, we need to format the front matter, as well as replacing wiki
links.

It contains wiki link does no exist [[fake link]] an wiki links that exists like
this one [[good link|under an alias!]]`;

const _NOTE_PROCESSED_CONTENT = `Do not delete me

Hello world,

This a note to test the behavior of the application. The whole point of that
tool is to take your Obsidian note and copy them across your Astro website. But
in order to do so, we need to format the front matter, as well as replacing wiki
links.

It contains wiki link does no exist fake link an wiki links that exists like
this one [under an alias!](./good-link)`;

const _NOTE_PROCESSED = `---
title: hello world
tags:
  - hello
  - world
created_at: 2023-01-01T02:00:00.000Z
description: ''
published_at: 2023-01-01T02:00:00.000Z
last_modified_at: 2023-01-01T08:00:00.000Z
status: publish
slug: hello-world

--- 
Do not delete me

Hello world,

This a note to test the behavior of the application. The whole point of that
tool is to take your Obsidian note and copy them across your Astro website. But
in order to do so, we need to format the front matter, as well as replacing wiki
links.

It contains wiki link does no exist fake link an wiki links that exists like
this one [under an alias!](./good-link)`;

describe("Note class", () => {
  let note: Note;
  const filePath = "test/__fixtures__/source/fake-note.md";
  const filePathWithoutFrontmatter =
    "test/__fixtures__/source/note-without-frontmatter.md";
  const fileContent = Deno.readTextFileSync(filePath);

  beforeAll(() => {
    stub(Date, "now", () => new Date("2023-01-01T02:00:00.000Z").getTime());
  });
  beforeEach(() => {
    note = Note.new(filePath) as Note;
  });
  it("should instantiate a Note object from a file path", () => {
    assertEquals(note.filePath, filePath);
    assertEquals(note.originalFile, fileContent);
  });

  it("should let me obtain the frontmatter", () => {
    const expected: Frontmatter = {
      title: "hello world",
      description: "",
      created_at: new Date("2023-01-01 12:00"),
      last_modified_at: new Date("2023-01-01 18:00"),
      published_at: new Date("2023-01-01T02:00:00.000Z"),
      slug: "hello-world",
      status: "published",
      tags: ["hello", "world"],
    };
    assertEquals(expected, note.processedFrontmatter);
  });

  it("should return null if there is no frontmatter", () => {
    const noteWithoutFrontMatter = Note.new(
      filePathWithoutFrontmatter,
    );
    const expected = null;
    noteWithoutFrontMatter === expected;
  });

  it("should let me obtain the note original content", () => {
    const expected = NOTE_CONTENT;
    assertEquals(note.originalContent, expected);
  });

  it("should update the published_at date if it is not set", () => {
    assertEquals(
      note.processedFrontmatter.published_at,
      new Date("2023-01-01T02:00:00.000Z"),
    );

    const noteWithPublishedAt = Note.new(
      "./test/__fixtures__/source/folder/subfolder/note3.md",
    ) as Note;
    assertEquals(
      noteWithPublishedAt.processedFrontmatter.published_at,
      new Date("2022-01-01T10:00:00.000Z"),
    );
  });
});
