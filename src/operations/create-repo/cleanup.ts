import { remove } from "fs-extra";
import { getErrorMessage, type DirectoryStatus } from "./application.js";
import type { GitHubRepo } from "./repo.js";
import { execa } from "execa";

export async function cleanup(
  originalError: unknown,
  repo: GitHubRepo,
  directoryStatus: DirectoryStatus,
) {
  const cleanupErrorMessages = await attemptCleanup(repo, directoryStatus);
  return combineErrors(originalError, cleanupErrorMessages);
}

async function attemptCleanup(
  repo: GitHubRepo,
  directoryStatus: DirectoryStatus,
) {
  return [
    await cleanupDirectory(repo.directory, directoryStatus),
    await cleanupRepo(repo),
  ].filter((cleanupError) => cleanupError !== "");
}

function combineErrors(originalError: unknown, cleanupErrorMessages: string[]) {
  if (cleanupErrorMessages.length === 0) {
    return originalError;
  }
  const cleanupErrorCombined = `\n\nCleanup failures:\n${cleanupErrorMessages.join("\n")}`;
  if (originalError instanceof Error) {
    originalError.message += cleanupErrorCombined;
    return originalError;
  } else {
    const message = getErrorMessage(originalError) + cleanupErrorCombined;
    return new Error(message);
  }
}

async function cleanupDirectory(directory: string, status: DirectoryStatus) {
  if (status === "created") {
    try {
      await remove(directory);
    } catch (error) {
      return getErrorMessage(error);
    }
  }
  return "";
}

async function cleanupRepo(repo: GitHubRepo) {
  try {
    await execa("gh", repo.ghDeleteArgs());
    return "";
  } catch (error) {
    return getErrorMessage(error);
  }
}
