import { combineErrors } from "./application/combine-errors.js";
import { extractErrorMessage } from "./application/extract-error-message.js";
import {
  type CreateRepoOptions,
  type Repo,
  createRepo,
} from "./domain/repo.js";
import {
  deleteRepo,
  createRepo as ghCreateRepo,
} from "./infrastructure/git-hub.js";
import { cloneRepo as gitCloneRepo } from "./infrastructure/git.js";

export async function handleCreateRepo(
  owner: string,
  directory: string,
  options?: CreateRepoOptions,
) {
  const repo = createRepo(owner, directory, options);
  await ghCreateRepo(repo);
  await cloneRepo(repo);
  return repo;
}

async function cloneRepo(repo: Repo) {
  try {
    await gitCloneRepo(repo);
  } catch (error) {
    const cleanupError = await cleanupRepo(repo);
    throw cleanupError ? combineErrors(error, cleanupError) : error;
  }
}

async function cleanupRepo(repo: Repo) {
  try {
    await deleteRepo(repo);
  } catch (error) {
    return `Cleanup Error: ${extractErrorMessage(error)}`;
  }
  return "";
}
