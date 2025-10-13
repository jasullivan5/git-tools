import { execa } from "execa";
import path from "node:path";
import os from "node:os";
import { mkdtemp, remove, move } from "fs-extra";

const organizationName = "jasullivan5-org";
const repoDestination = "/c/Users/jasul/repos";
const gitHubBaseUrl = "https://github.com/";
const gitHubUrlSuffix = ".git";
const temporaryDirectoryPrefix = "create-repo-";

export async function createRepo(repoName: string): Promise<string> {
  const fullRepo = `${organizationName}/${repoName}`;
  const repoUrl = gitHubBaseUrl + fullRepo + gitHubUrlSuffix;

  await execa("gh", ["repo", "create", fullRepo, "--public"]);

  try {
    return await cloneRepo(repoUrl, path.join(repoDestination, repoName));
  } catch (error) {
    try {
      await execa("gh", ["repo", "delete", fullRepo, "--yes"]);
    } catch (cleanupError) {
      // Compose both messages so `err.message` shows everything.
      throw withCleanupMessage(
        `Failed to delete remote repo: ${repoUrl}`,
        error,
        cleanupError,
      );
    }
    throw error;
  }
}

async function cloneRepo(httpsUrl: string, localPath: string) {
  const temporaryPathPrefix = path.join(os.tmpdir(), temporaryDirectoryPrefix);
  const temporaryDirectory = await mkdtemp(temporaryPathPrefix);
  try {
    await execa("git", ["clone", httpsUrl, temporaryDirectory]);
  }

  try {
    await execa("git", ["clone", httpsUrl, temporaryDirectory]);
    await move(temporaryDirectory, localPath, { overwrite: false });
  } catch (error) {
    try {
      await remove(temporaryDirectory);
    } catch (cleanupError) {
      throw withCleanupMessage(
        `Failed to delete temporary directory: ${temporaryDirectory}`,
        error,
        cleanupError,
      );
    }
    throw error;
  }

  return localPath;
}

/** Build an AggregateError whose .message already includes both error messages */
function withCleanupMessage(
  context: string,
  original: unknown,
  cleanup: unknown,
): AggregateError {
  const message =
    `${context}\n` +
    `Original error: ${toMessage(original)}\n` +
    `Cleanup error: ${toMessage(cleanup)}`;
  return new AggregateError([original, cleanup], message);
}

/** Safely turn unknown into a useful, single-line message */
function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message || error.toString();
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
