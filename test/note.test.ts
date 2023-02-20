import { Frontmatter, Note } from "../lib/note.ts";
import { assertEquals, beforeEach, describe, it } from "../deps.ts";

const NOTE_CONTENT = `Do not delete me

Hello world,

This a note to test the behavior of the application. The whole point of that
tool is to take your Obsidian note and copy them across your Astro website. But
in order to do so, we need to format the front matter, as well as replacing wiki
links.

It contains wiki link does no exist [[fake link]] an wiki links that exists like
this one [[good link|under an alias!]]`;

const NOTE_PROCESSED_CONTENT = `Do not delete me

Hello world,

This a note to test the behavior of the application. The whole point of that
tool is to take your Obsidian note and copy them across your Astro website. But
in order to do so, we need to format the front matter, as well as replacing wiki
links.

It contains wiki link does no exist fake link an wiki links that exists like
this one [under an alias!](./good-link)`;

const NOTE_PROCESSED = `---
title: hello world
tags:
  - hello
  - world
created_at: 2023-01-01T02:00:00.000Z
description: ''
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
  const filePathLinkedNote = "test/__fixtures__/source/good-link.md";
  const filePathWithoutFrontmatter =
    "test/__fixtures__/source/note-without-frontmatter.md";
  const fileContent = Deno.readTextFileSync(filePath);

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
      slug: "hello-world",
      status: "publish",
      tags: ["hello", "world"],
    };
    assertEquals(expected, note.frontmatter);
  });

  it("should return null if there is no frontmatter", () => {
    const noteWithoutFrontMatter = Note.new(
      filePathWithoutFrontmatter,
    );
    const expected = null;
    noteWithoutFrontMatter === expected;
  });

  it("should let me obtain the note original content", () => {
    // TODO fix this it should keep the \n newline
    const expected = NOTE_CONTENT;
    assertEquals(note.originalContent, expected);
  });

  //   it("should create a slug out of the title if no slug is provided",() => {
  //       // TODO

  //   })
});
