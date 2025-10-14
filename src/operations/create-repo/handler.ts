import { execa } from "execa";
import path from "node:path";
import os from "node:os";
import { mkdtemp, remove, move } from "fs-extra";

const organizationName = "jasullivan5-org";
const repoDestination = "/c/Users/jasul/repos";
const gitHubBaseUrl = "https://github.com/";
const gitHubUrlSuffix = ".git";
const temporaryDirectoryPrefix = "create-repo-";

interface CleanupNeeded {
  cleanupRepoName: string | undefined;
  cleanupTemporaryDirectory: string | undefined;
}

export async function createRepo(repoName: string) {
  const fullRepoName = `${organizationName}/${repoName}`;
  const localPath = path.join(repoDestination, repoName);
  const repoUrl = gitHubBaseUrl + fullRepoName + gitHubUrlSuffix;
  const temporaryPathPrefix = path.join(os.tmpdir(), temporaryDirectoryPrefix);

  await execa("gh", ["repo", "create", fullRepoName, "--public"]);
  const cleanupNeeded: CleanupNeeded = {
    cleanupRepoName: fullRepoName,
    cleanupTemporaryDirectory: undefined,
  };
  try {
    const temporaryDirectory = await mkdtemp(temporaryPathPrefix);
    cleanupNeeded.cleanupTemporaryDirectory = temporaryDirectory;
    await execa("git", ["clone", repoUrl, temporaryDirectory]);
    await move(temporaryDirectory, localPath, { overwrite: false });
  } catch (error) {
    const cleanupErrorMessages = await cleanup(cleanupNeeded);

    if (cleanupErrorMessages.length > 0) {
      const cleanupMessage =
        "\n\nCleanup failures:\n" + cleanupErrorMessages.join("\n");

      if (error instanceof Error) {
        error.message += cleanupMessage;
        throw error; // preserves stack, name, and any custom props
      } else {
        // fallback for non-Error values
        const message = getErrorMessage(error) + cleanupMessage;
        throw new Error(message);
      }
    }

    throw error; // rethrow original if cleanup succeeded
  }
  return localPath;
}

async function cleanup(cleanupNeeded: CleanupNeeded) {
  const errorMessages: string[] = [];
  if (cleanupNeeded.cleanupTemporaryDirectory) {
    try {
      await remove(cleanupNeeded.cleanupTemporaryDirectory);
    } catch (error) {
      errorMessages.push(getErrorMessage(error));
    }
  }
  if (cleanupNeeded.cleanupRepoName) {
    try {
      await execa("gh", [
        "repo",
        "delete",
        cleanupNeeded.cleanupRepoName,
        "--yes",
      ]);
    } catch (error) {
      errorMessages.push(getErrorMessage(error));
    }
  }
  return errorMessages;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
