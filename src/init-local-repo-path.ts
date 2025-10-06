import { access, mkdir, readdir, stat } from "node:fs/promises";
import { constants, Stats } from "node:fs";
import type { RepoPathState } from "./repo-path.js";
import { RepoPath } from "./repo-path.js";

export async function initLocalRepoPath(
  path: string,
): Promise<{ repoPath: RepoPath; state: RepoPathState }> {
  const repoPath = new RepoPath(path);

  await assertDirectoryExists(repoPath.parentDirectory);
  await assertDirectoryWritable(repoPath.parentDirectory);

  const leafStats = await getPathStats(repoPath.absolutePath);
  if (!leafStats) {
    // Leaf doesn't exist → create ONLY the leaf
    await mkdir(repoPath.absolutePath);
    return { repoPath, state: "created" };
  }

  // Leaf exists → validate it's safe
  await assertNoGitDirectory(repoPath);
  await assertEmptyDirectory(repoPath.absolutePath);

  return { repoPath, state: "existed" };
}

async function assertDirectoryExists(path: string): Promise<void> {
  const stats = await getPathStats(path);
  if (!stats?.isDirectory()) {
    throw new Error(
      `Parent directory does not exist: ${path}\n` +
        `Create the parent first, then re-run. (We don’t create missing parents.)`,
    );
  }
}

async function assertDirectoryWritable(path: string): Promise<void> {
  try {
    await access(path, constants.W_OK | constants.X_OK);
  } catch {
    throw new Error(`Parent directory is not writable: ${path}`);
  }
}

async function assertNoGitDirectory(repoPath: RepoPath): Promise<void> {
  const gitPath = repoPath.getGitPath();
  const stats = await getPathStats(gitPath);
  if (stats?.isDirectory()) {
    throw new Error(
      `Target directory already contains a Git repository: ${repoPath.absolutePath}\n` +
        `Choose a different path or remove the existing .git directory.`,
    );
  }
}

async function assertEmptyDirectory(path: string): Promise<void> {
  const entries = await readdir(path);
  if (entries.length > 0) {
    throw new Error(
      `Target directory is not empty: ${path}\n` +
        `Please use an empty directory (no files) for initialization.`,
    );
  }
}

async function getPathStats(path: string): Promise<Stats | null> {
  try {
    return await stat(path);
  } catch (error: unknown) {
    if (isEnoent(error)) return null;
    throw error;
  }
}

function isEnoent(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT",
  );
}
