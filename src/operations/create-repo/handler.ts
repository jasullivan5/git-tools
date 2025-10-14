import { execa } from "execa";
import { GitHubRepo } from "./repo.js";
import { ensureDirectory, type DirectoryStatus } from "./utilities.js";
import { cleanup } from "./cleanup.js";

export async function createRepo(owner: string, directory: string) {
  const repo = new GitHubRepo(owner, directory);
  let directoryStatus: DirectoryStatus = "unknown";

  await execa("gh", repo.ghCreateArgs());
  try {
    directoryStatus = await ensureDirectory(repo.directory);
    await execa("git", repo.gitCloneArgs());
  } catch (error) {
    const newError = await cleanup(error, repo, directoryStatus);
    throw newError;
  }
  return repo;
}
