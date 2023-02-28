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
   options?: Options
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
   backupDir: string
): string {
   // Create a random backup dir
   const uniqueBackupDir = join(
      backupDir,
      new Date().toDateString(),
      crypto.randomUUID()
   );
   prepareDestDirectory(uniqueBackupDir);

   try {
      copySync(sourceDir, join(uniqueBackupDir, "source"), { overwrite: true });
      copySync(destinationDir, join(uniqueBackupDir, "destination"), {
         overwrite: true,
      });
      logger.info(
         `"Backup successful. \n Backup directory: ${uniqueBackupDir}`
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

/**
 * Helper function to handle the result of a command
 */
async function handleCommandResult(
   gitAddCmd: Deno.Process<{
      cwd: string;
      cmd: string[];
      stdout: "piped";
      stderr: "piped";
   }>
): Promise<string> {
   const [status, stdout, stderr] = await Promise.all([
      gitAddCmd.status(),
      gitAddCmd.output(),
      gitAddCmd.stderrOutput(),
   ]);

   if (status.code === 0) {
      const result = new TextDecoder().decode(stdout);
      return result;
   } else {
      logger.error(new TextDecoder().decode(stderr));
      Deno.exit(1);
   }
}

/**
 * Given a directory, return the git root of the directory if there is one
 */
async function getGitRoot(dirPath: string): Promise<string> {
   const gitRootCmd = Deno.run({
      cwd: dirPath,
      cmd: ["git", "rev-parse", "--show-toplevel"],
      stdout: "piped",
      stderr: "piped",
   });

   return (await handleCommandResult(gitRootCmd)).replace("\n", "");
}

/**
 * Add a directory to git
 */
async function addDirectoryChangesToGit(dirPath: string): Promise<string> {
   const gitRoot = await getGitRoot(dirPath);

   const gitAddCmd = Deno.run({
      cwd: gitRoot,
      cmd: ["git", "add", dirPath],
      stdout: "piped",
      stderr: "piped",
   });

   return await handleCommandResult(gitAddCmd);
}

/**
 * Create a git branch
 */
async function checkoutNewGitBranch(
   dirPath: string,
   branchName: string
): Promise<string> {
   const gitRoot = await getGitRoot(dirPath);
   const gitBranchCmd = await Deno.run({
      cwd: gitRoot,
      cmd: ["pwd"],
      // cmd: ["git", "checkout", "-b", branchName],
      stdout: "piped",
      stderr: "piped",
   });

   const r = await handleCommandResult(gitBranchCmd);
   return r;
}

/**
 * Commit the changes in a directory
 */
async function commitChanges(dirPath: string, message: string): Promise<void> {
   const gitRoot = await getGitRoot(dirPath);

   const gitCommitCmd = Deno.run({
      cwd: gitRoot,
      cmd: ["git", "commit", "-m", message],
      stdout: "piped",
      stderr: "piped",
   });

   await handleCommandResult(gitCommitCmd);
}

/**
 * Push the changes to the remote
 */
async function pushChanges(dirPath: string): Promise<void> {
   const gitRoot = await getGitRoot(dirPath);

   const gitPushCmd = Deno.run({
      cwd: gitRoot,
      cmd: ["git", "push", "-u", "origin", "HEAD"],
      stdout: "piped",
      stderr: "piped",
   });

   await handleCommandResult(gitPushCmd);
}

export async function publishToGit(blogDir: string) {
   await checkoutNewGitBranch(blogDir, `autopublish-${Date.now()}`);
   await addDirectoryChangesToGit(blogDir);
   await commitChanges(blogDir, "Autopublish from Obsidian");
   await pushChanges(blogDir);
}
