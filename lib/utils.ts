// import { Note } from "./types.ts";
import { copySync, crypto, emptyDirSync, join, logger } from "../deps.ts";

type Options = {
  match: RegExp;
};

/**
 * Given a directory, return all the files path in it
 * Optionally, you can pass a regex to match the files
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
 */
export function createBackup(
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
 */
export function prepareDestDirectory(dirPath: string) {
  try {
    emptyDirSync(dirPath);
  } catch {
    Deno.mkdirSync(dirPath, { recursive: true });
  }
}
