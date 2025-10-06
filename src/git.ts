import { execa } from "execa";

export async function getDefaultBranch(): Promise<string> {
  try {
    const { stdout } = await execa("git", [
      "config",
      "--global",
      "init.defaultBranch",
    ]);
    const value = stdout.trim();
    return value || "main";
  } catch {
    return "main";
  }
}

export async function initLocalRepo(
  absPath: string,
  defaultBranch: string,
): Promise<void> {
  await execa("git", ["init", "-b", defaultBranch], { cwd: absPath });
}

export async function createEmptyCommit(
  absPath: string,
  purpose: string,
): Promise<void> {
  const message = `Repo Purpose: ${purpose}`;
  // Let git surface config errors (e.g., missing user.name/email)
  await execa("git", ["commit", "--allow-empty", "-m", message], {
    cwd: absPath,
  });
}

export async function addOrigin(
  absPath: string,
  remoteUrl: string,
): Promise<void> {
  // Remove existing origin silently (ignore if it doesn't exist).
  try {
    await execa("git", ["remote", "remove", "origin"], { cwd: absPath });
  } catch {
    // no-op
  }
  await execa("git", ["remote", "add", "origin", remoteUrl], { cwd: absPath });
}

export async function pushInitial(
  absPath: string,
  defaultBranch: string,
): Promise<void> {
  await execa("git", ["push", "-u", "origin", defaultBranch], {
    cwd: absPath,
  });
}
