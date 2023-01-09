// We assume vaults in /vaults/blog
// const VAULT_DIR = `${os.homedir}/vaults`
import * as path from "https://deno.land/std@0.171.0/path";

import { parse } from "https://deno.land/x/yaml@v2.2.1";

const homedir = Deno.env.get("HOME");
const VAULT_DIR = `${homedir}/obsidian/20_areas/20.30_blog`;
const BLOG_DIR = `${homedir}/my-site/src/blog/`;

interface Frontmatter {
   title: string;
   tags: string[];
   created_at: string;
   last_modified_at: string;
   draft: boolean;
   slug: string;
}

interface Note {
   title: string;
   filePath: string;
   content: string;
   frontmatter: Frontmatter;
}

console.log(homedir);

async function parseFileIntoNote(filePath: string): Promise<Note | null> {
   let content: string;

   try {
      content = await Deno.readTextFile(filePath);
   } catch (e) {
      // Content throw an error if it's a directory
      return null;
   }

   try {
      let rawFrontmatter = parse(content.split("---")[1]);
      const frontmatter = {
         ...rawFrontmatter,
         created_at: new Date(rawFrontmatter.created_at),
         last_modified_at: new Date(rawFrontmatter.last_modified_at),
         slug:
            rawFrontmatter?.slug ??
            rawFrontmatter.title.split(" ").join("-").toLowerCase(),
      };
      return {
         title: path.basename(filePath),
         filePath,
         content,
         frontmatter,
      };
   } catch (e) {
      console.warn(
         `${path.basename(
            filePath
         )} doesn't have a frontmatter and won't be published.`
      );
      return null;
   }
}

async function getAllNotes(directory: string): Promise<Note[]> {
   const notes: Note[] = [];
   await findNotesInDirectoryRecursively(directory, notes);
   return notes;
}

async function findNotesInDirectoryRecursively(
   directory: string,
   notes: Note[]
): Promise<Note[]> {
   const subdirs = await Deno.readDir(directory);

   for await (const subdir of subdirs) {
      const subdirPath = path.join(directory, subdir);
      if (subdir.isDirectory) {
         await findNotesInDirectoryRecursively(subdirPath, notes);
      }
      const parsedNote = await parseFileIntoNote(subdirPath);
      if (parsedNote) {
         notes.push(parsedNote);
      }
   }

   return notes;
}

// async function replaceWikilinks(notes: Note[]): Promise<Note[]> {
//    return notes.map((note) => {
//       const { content } = note;
//       const lines = content.split("\n");
//       lines.map((line) => {
//          const regexp = /\[\[.+?\|?.*?\]\]/g;
//          const wikilinks = line.match(regexp);

//          if (!wikilinks) {
//             return line;
//          }

//          line.replace(regexp, processLink);

//          function processLink(link: string): string {
//             const [file, title] = link.slice(2, -2).split("|");
//             const linkedNote = notes.find((note) => note.title === file);
//             if (!linkedNote) {
//                return line;
//             }
//             return `[${title ?? file}](/${linkedNote.frontmatter.slug})}`;
//          }
//       });
//       return note;
//    });
// }

console.log(`Using the following directories:
    - Blog: ${BLOG_DIR},
    - Vault: ${VAULT_DIR},
	 Make sure these are the right ones!
`);

// getAllNotes(VAULT_DIR)
//    .then((notes) => replaceWikilinks(notes))
//    .then((notes) => {
//       if (existsSync(BLOG_DIR)) {
//          rmdirSync(BLOG_DIR, { recursive: true });
//       }
//       mkdirSync(BLOG_DIR, { recursive: true });

//       notes.map((note) =>
//          fsp.writeFile(
//             `${path.join(BLOG_DIR, note.frontmatter.slug)}.md`,
//             note.content
//          )
//       );
//    });
