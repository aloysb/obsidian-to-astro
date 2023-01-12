import { basename, join } from "https://deno.land/std@0.171.0/path/mod.ts";
import { Frontmatter, Note } from "./types.ts";

import { parse } from "https://deno.land/std@0.171.0/encoding/yaml.ts";

export async function getAllProcessedNotes(directory: string): Promise<Note[]> {
   const notes: Note[] = [];
   await findNotesInDirectoryRecursively(directory, notes);
   const processedNotes = await replaceWikilinks(notes.filter(({ frontmatter }) => frontmatter.status === 'publish'));
   return processedNotes;
}

async function findNotesInDirectoryRecursively(
   directory: string,
   notesAccumulator: Note[]
): Promise<Note[]> {
   const subdirs = await Deno.readDir(directory);

   for await (const subdir of subdirs) {
      const subdirPath = join(directory, subdir.name);
      if (subdir.isDirectory) {
         await findNotesInDirectoryRecursively(subdirPath, notesAccumulator);
      }
      const parsedNote = await parseFileIntoNote(subdirPath);
      if (parsedNote) {
         notesAccumulator.push(parsedNote);
      }
   }

   return notesAccumulator;
}

async function parseFileIntoNote(filePath: string): Promise<Note | null> {
   let content: string;
   try {
      content = await Deno.readTextFile(filePath);
   } catch (e) {
      return null;
   }

   try {
      const rawFrontmatter = parse(content.split("---")[1]) as Frontmatter;
      const frontmatter = {
         ...rawFrontmatter,
         created_at: new Date(rawFrontmatter.created_at),
         last_modified_at: new Date(rawFrontmatter.last_modified_at),
         slug:
            rawFrontmatter?.slug ??
            rawFrontmatter.title.split(" ").join("-").toLowerCase(),
      };
      return {
         title: basename(filePath),
         filePath,
         content,
         frontmatter,
      };
   } catch (e) {
      console.warn(
         `${basename(
            filePath
         )} doesn't have a frontmatter and won't be published.`
      );
      return null;
   }
}

export function replaceWikilinks(notes: Note[]): Note[] {
   return notes.map((note) => {
      const { content } = note;
      const lines = content.split("\n");
      note.content = lines
         .map((line) => {
            const regexp = /\[\[.+?\|?.*?\]\]/g;
            const wikilinks = line.match(regexp);

            if (!wikilinks) {
               return line;
            }
            const newLine = line.replace(regexp, processLink);
            return newLine;

            function processLink(link: string): string {
               const [file, title] = link.slice(2, -2).split("|");
               const linkedNote = notes.find(
                  (note) => note.title === `${file}.md`
               );
               if (!linkedNote) {
                  console.log(
                     `${note.filePath} has a link to '${file}' that we could not resolve. The link has been ignored.`
                  );
                  const replace = `${title ?? file}`;
                  return replace;
               }
               const replace = `[${title ?? file}](./${linkedNote.frontmatter.slug
                  })`;
               return replace;
            }
         })
         .join("\n");
      return note;
   });
}
