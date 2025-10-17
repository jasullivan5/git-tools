import { combineErrors } from "../../application/combine-errors.js";
import { extractErrorMessage } from "../../application/extract-error-message.js";
import {
  type Repo,
  type RepoVisibility,
  createRepo,
} from "../../domain/repo.js";

export interface GitHost {
  createRepo(repo: Repo): Promise<void>;
  deleteRepo(repo: Repo): Promise<void>;
}

export interface Git {
  cloneRepo(repo: Repo): Promise<void>;
}

export function makeCreateRepoHandler(git: Git, gitHost: GitHost) {
  return async function handleCreateRepo(
    owner: string,
    directory: string,
    visibility: RepoVisibility,
    baseUrl: string,
  ) {
    const repo = createRepo(owner, directory, visibility, baseUrl);
    await gitHost.createRepo(repo);
    await cloneRepo(repo);
    return repo;
  };

  async function cloneRepo(repo: Repo) {
    try {
      await git.cloneRepo(repo);
    } catch (error) {
      const cleanupError = await cleanupRepo(repo);
      throw cleanupError ? combineErrors(error, cleanupError) : error;
    }
  }

  async function cleanupRepo(repo: Repo) {
    try {
      await gitHost.deleteRepo(repo);
    } catch (error) {
      return `Cleanup Error: ${extractErrorMessage(error)}`;
    }
    return "";
  }
}
