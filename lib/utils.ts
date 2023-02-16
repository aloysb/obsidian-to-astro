// import { Note } from "./types.ts";
import { copySync, crypto, emptyDirSync, join, logger } from "./deps.ts";

import { Note } from "./note.ts";

// export async function getAllProcessedNotes(directory: string): Promise<Note[]> {
//    const notes: Note[] = await findNotesInDirectoryRecursively(directory);
//    const processedNotes = await replaceWikilinks(notes.filter(({ frontmatter }) => frontmatter.status === 'publish'));
//    return processedNotes;
// }

/**
 * @param directory The directory to search. Note that the result will be base on this directory, so if you provide a relative path, the result will be relative.
 * @returns The list of files path
 */
type Options = {
  match: RegExp;
};

/**
 * Given a directory, find all the files matching the options provided and return their file paths.
 *
 * @param directory the directory to search
 * @param options options to filter the result. So far, the sole option is to provide a regexp to match.
 * @returns an array of filepath for the files matching the search options in the directory provided
 */
export async function findFilesRecursively(
  directory: string,
  options?: Options,
): Promise<string[]> {
  const files: string[] = [];
  const subdirs = await Deno.readDir(directory);

  for await (const subdir of subdirs) {
    const subdirPath = join(directory, subdir.name);
    if (subdir.isFile) {
      if (options?.match && !options.match.test(subdir.name)) {
        continue;
      }
      files.push(`${directory}/${subdir.name}`);
    } else {
      files.push(...(await findFilesRecursively(subdirPath, options)));
    }
  }
  return files;
}

/**
 * Prepare a backup of both the source and the destination folders
 * @param sourceDir source dir filepath
 * @param destinationDir  destination dir filepath
 * @param backupDir the location of the backups
 */
export function prepareBackups(
  sourceDir: string,
  destinationDir: string,
  backupDir: string,
): string {
  console.log(backupDir);
  // Create a random backup dir
  const uniqueBackupDir = join(
    backupDir,
    new Date().toDateString(),
    crypto.randomUUID(),
  );
  prepareDestDirectory(uniqueBackupDir);

  try {
    copySync(sourceDir, join(uniqueBackupDir, "source"), { overwrite: true });
    copySync(destinationDir, join(uniqueBackupDir, "destination"), {
      overwrite: true,
    });
    logger.info(
      `"Backup successful. \n Backup directory: ${uniqueBackupDir}`,
    );
    return uniqueBackupDir;
  } catch (e) {
    logger.error(`Failed to prepare backup: \n ${e}`);
    throw new Error("Fail to prepare backups");
  }
}

/**
 * Prepare the destination directory:
 * Empty the directory of all files or create a new directory at the given path
 * @param dirPath the path of the directory to empty
 */
export function prepareDestDirectory(dirPath: string) {
  try {
    emptyDirSync(dirPath);
  } catch {
    Deno.mkdirSync(dirPath, { recursive: true });
  }
}

export function publishNotes(notes: Note[], dirPath: string) {
  notes.forEach((note) => {
    const contentToPublish = note.processedFile();
    if (!contentToPublish) {
      return;
    }
    let slug = note.frontmatter?.slug;
    if (!slug) {
      slug = note.frontmatter?.title?.toLowerCase().replace(/ /g, "-");
      return;
    }
    Deno.writeTextFileSync(join(dirPath, `${slug}.md`), contentToPublish);
  });
}
