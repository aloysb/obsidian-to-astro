/*
 * This file contains some utility functions for testing.
 * Instead of mutation directly the files in the fixture directories, we should create a new directory for each test and copy the fixture files in it.
 * This way, we can be sure that each test is independent from the others.
 */

import { findFilesRecursively } from "../lib/utils.ts";
import { join } from "../deps.ts";

export interface TestFixtures {
  destroy: () => void;
  directories: {
    sourceDir: string;
    blogDir: string;
    backupDir: string;
  };
}

export async function setupTestDirectories(): Promise<TestFixtures> {
  // Create the directories
  const directories: TestFixtures["directories"] = {
    sourceDir: Deno.makeTempDirSync(),
    blogDir: Deno.makeTempDirSync(),
    backupDir: Deno.makeTempDirSync(),
  };

  // Copy all files from the fixtures directory to the source directory
  for (const file of await findFilesRecursively("./test/__fixtures__/source")) {
    Deno.copyFileSync(
      file,
      join(directories.sourceDir, file.split("/").pop() ?? file),
    );
  }

  // A function to remove the directories after the test
  const destroy = () => {
    for (const dir of Object.values(directories)) {
      Deno.removeSync(dir, { recursive: true });
    }
  };

  return {
    directories,
    destroy,
  };
}
