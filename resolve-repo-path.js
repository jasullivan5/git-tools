// @ts-check
import fs from "node:fs/promises";
import { RepoPath } from "./repo-path.js";

/**
 * Validate the target repo directory and prepare it if needed.
 * - Parent directory must exist (we do NOT create parents).
 * - If leaf doesn't exist, create ONLY the leaf directory.
 * - If leaf exists and has a `.git` directory -> error.
 * - If leaf exists and is non-empty -> error.
 *
 * @param {RepoPath} repo - RepoPath instance.
 * @returns {Promise<{ exists: boolean, created: boolean }>}
 */
export async function validateAndPrepareLeaf(repo) {
  await assertDirectoryExists(repo.parentDirectory);
  await assertDirectoryWritable(repo.parentDirectory);

  const leafStats = await getPathStats(repo.absolutePath);
  if (!leafStats) {
    // Leaf doesn't exist → create ONLY the leaf
    await fs.mkdir(repo.absolutePath);
    return { exists: false, created: true };
  }

  // Leaf exists → validate it's safe
  await assertNoGitDirectory(repo);
  await assertEmptyDirectory(repo.absolutePath);

  return { exists: true, created: false };
}

/**
 * @param {string} directory
 */
async function assertDirectoryExists(directory) {
  const stats = await getPathStats(directory);
  if (!stats?.isDirectory()) {
    throw new Error(
      `Parent directory does not exist: ${directory}\n` +
        `Create the parent first, then re-run. (We don’t create missing parents.)`,
    );
  }
}

/**
 * @param {string} directory
 */
async function assertDirectoryWritable(directory) {
  try {
    await fs.access(directory, fs.constants.W_OK | fs.constants.X_OK);
  } catch {
    throw new Error(`Parent directory is not writable: ${directory}`);
  }
}

/**
 * @param {RepoPath} repo
 */
async function assertNoGitDirectory(repo) {
  const gitPath = repo.gitDir();
  const stats = await getPathStats(gitPath);
  if (stats?.isDirectory()) {
    throw new Error(
      `Target directory already contains a Git repository: ${repo.absolutePath}\n` +
        `Choose a different path or remove the existing .git directory.`,
    );
  }
}

/**
 * @param {string} directory
 */
async function assertEmptyDirectory(directory) {
  const entries = await fs.readdir(directory);
  if (entries.length > 0) {
    throw new Error(
      `Target directory is not empty: ${directory}\n` +
        `Please use an empty directory (no files) for initialization.`,
    );
  }
}

/**
 * @param {string} path
 * @returns {Promise<import("node:fs").Stats | null>}
 */
async function getPathStats(path) {
  try {
    return await fs.stat(path);
  } catch (error) {
    // @ts-expect-error Node error code
    if (error && error.code === "ENOENT") return null;
    throw error;
  }
}
