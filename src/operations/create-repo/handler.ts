import { execa } from "execa";
import { GitHubRepo } from "./domain/repo.js";
import {
  ensureDirectory,
  type DirectoryStatus,
} from "./application/ensure-directory.js";
import { cleanup } from "./application/cleanup.js";

export async function createRepo(owner: string, directory: string) {
  const repo = new GitHubRepo(owner, directory);
  let directoryStatus: DirectoryStatus = "unknown";

  await execa("gh", repo.ghCreateArgs());

  try {
    directoryStatus = await ensureDirectory(repo.directory);
    await execa("git", repo.gitCloneArgs());
  } catch (error) {
    const cleanupError = await cleanup(error, repo, directoryStatus);
    throw cleanupError;
  }
  return repo;
}
