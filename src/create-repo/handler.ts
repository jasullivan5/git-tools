import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

function hasErrnoCode(error: unknown, ...errnoCodes: string[]) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    errnoCodes.includes(error.code)
  );
}

async function findOrCreateNewRepoDirectory(newRepoPath: string) {
  const newRepoPathResolved = path.resolve(newRepoPath);
  const parentDirectory = path.dirname(newRepoPathResolved);
  try {
    await mkdir(newRepoPathResolved);
  } catch (error: unknown) {
    if (hasErrnoCode(error, "ENOENT")) {
      throw new Error(
        `Parent directory does not exist: ${parentDirectory}. Create it first or choose an existing parent.`,
      );
    } else if (hasErrnoCode(error, "EACCES", "EPERM")) {
      throw new Error(
        `Permission denied creating directory: ${newRepoPathResolved}. Check write permissions for ${parentDirectory}.`,
      );
    } else if (!hasErrnoCode(error, "EEXIST")) {
      throw error;
    }
  }
  return newRepoPathResolved;
}

async function assertDirectoryEmpty(newRepoPathResolved: string) {
  try {
    const entries = await readdir(newRepoPathResolved);
    if (entries.length > 0) {
      throw new Error(`Target directory is not empty: ${newRepoPathResolved}.`);
    }
  } catch (error) {
    if (hasErrnoCode(error, "ENOTDIR")) {
      throw new Error(
        `Target exists but is not a directory: ${newRepoPathResolved}. Choose a different path.`,
      );
    }
    throw error;
  }
}

export async function createRepo(newRepoPath: string) {
  const newRepoPathResolved = await findOrCreateNewRepoDirectory(newRepoPath);
  await assertDirectoryEmpty(newRepoPathResolved);
  return newRepoPathResolved;
  // Validate Derived Repo Name (for GitHub)
  // - Ensure the leaf name adheres to GitHub repo naming rules (length, characters).
  // - Normalize obvious issues (trim whitespace); warn about case normalization if applicable.
  // Load Org & Auth Preflight (Fail Fast)
  // - Read GitHub organization identifier from env/config.
  // - Verify GitHub auth is present and has the right scopes (public repo creation).
  // - Confirm the org exists and the user/app has permission to create repos in it.
  // - Check remote name collision in the org (repo with same name). If taken, fail fast with a suggested alternative (e.g., suffix).
  // Prompt for Purpose
  // - Prompt the user: “What’s the purpose of this repo?”
  // - Allow re-entry on empty input; trim leading/trailing whitespace.
  // - Build the commit message: Repo Purpose: ${userInput}.
  // Determine Default Branch
  // - Inspect git config --global init.defaultBranch; if unset, use main.
  // - Keep this value for both local init and remote default.
  // Initialize Local Git Repo
  // - Run: git init -b <defaultBranch> in the leaf directory (use the resolved default).
  // - Create an empty commit with --allow-empty and the purpose message.
  // Create Remote GitHub Repo (Public)
  // - Create a public repo under the configured org with the derived name.
  // - Set its default branch to match the local default (if the API/CLI allows at creation; otherwise update after first push).
  // Connect & Push
  // - Add origin remote to the new GitHub repo URL (SSH or HTTPS—respect user/env preference).
  // - Push the default branch, setting upstream (-u origin <defaultBranch>).
  // Post-Creation Sync (Optional-but-Recommended Consistency)
  // - If the remote couldn’t set default branch at creation, ensure remote default branch now matches after the push.
  // - (No extra content files created; keep repo empty except the initial commit.)
  // Report Success
  // - Print:
  //   - Absolute local path
  //   - Repo name and organization
  //   - Default branch used
  //   - GitHub URL
  // Prompt to Open in VS Code (No Flag; Always Ask)
  // - Ask: “Open this repo in VS Code now?” (Yes/No)
  // - On Yes: launch VS Code with the repo path (code <absPath>).
  // - On No: end gracefully.
  // Error Handling (Throughout)
  // - On any failure, emit a clear, user-oriented message with the failing step and a terse fix suggestion
  //   (e.g., “Parent directory does not exist”, “Repo name already taken in org”, “Missing GitHub permissions: need repo scope”).
  // - Set a non-zero exit code on failure; never leave a half-initialized .git without telling the user where to clean up.
}
