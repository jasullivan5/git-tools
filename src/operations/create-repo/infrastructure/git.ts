import { execa } from "execa";
import type { GitHubRepo } from "../domain/git-hub-repo.js";
import { ensureDir, pathExists, remove } from "fs-extra";
import { extractErrorMessage } from "../application/extract-error-message.js";
import { combineErrors } from "../application/combine-errors.js";

const git = "git";
type DirectoryState = "existed" | "created";

export async function cloneRepo(repo: GitHubRepo) {
  const directoryState = await ensureDirectory(repo.directory);
  try {
    await execa(git, ["clone", repo.url, repo.directory]);
  } catch (error) {
    const cleanupError = await cleanupDirectory(repo.directory, directoryState);
    throw cleanupError ? combineErrors(error, cleanupError) : error;
  }
}

async function ensureDirectory(directory: string): Promise<DirectoryState> {
  const existed = await pathExists(directory);
  await ensureDir(directory);
  return existed ? "existed" : "created";
}

async function cleanupDirectory(directory: string, state: DirectoryState) {
  if (state === "created") {
    try {
      await remove(directory);
    } catch (error) {
      return `Cleanup Error: ${extractErrorMessage(error)}`;
    }
  }
  return "";
}
