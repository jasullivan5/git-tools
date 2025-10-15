import { combineErrors } from "./application/combine-errors.js";
import { extractErrorMessage } from "./application/extract-error-message.js";
import { GitHubRepo } from "./domain/git-hub-repo.js";
import {
  deleteRepo,
  createRepo as ghCreateRepo,
} from "./infrastructure/git-hub.js";
import { cloneRepo as gitCloneRepo } from "./infrastructure/git.js";

export async function createRepo(owner: string, directory: string) {
  const repo = new GitHubRepo(owner, directory);
  await ghCreateRepo(repo);
  await cloneRepo(repo);
  return repo;
}

async function cloneRepo(repo: GitHubRepo) {
  try {
    await gitCloneRepo(repo);
  } catch (error) {
    const cleanupError = await cleanupRepo(repo);
    throw cleanupError ? combineErrors(error, cleanupError) : error;
  }
}

async function cleanupRepo(repo: GitHubRepo) {
  try {
    await deleteRepo(repo);
  } catch (error) {
    return `Cleanup Error: ${extractErrorMessage(error)}`;
  }
  return "";
}
