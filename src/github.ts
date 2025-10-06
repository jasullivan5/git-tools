import { execa } from "execa";

interface GitHubRepoResponse {
  html_url: string;
  ssh_url: string;
  clone_url: string;
}

function isRepoResponse(object: unknown): object is GitHubRepoResponse {
  return (
    typeof object === "object" &&
    object !== null &&
    "html_url" in object &&
    "ssh_url" in object &&
    "clone_url" in object &&
    typeof object.html_url === "string" &&
    typeof object.ssh_url === "string" &&
    typeof object.clone_url === "string"
  );
}

export async function checkAuthAndOrg(org: string): Promise<void> {
  try {
    await execa("gh", ["auth", "status"], { stdio: "ignore" });
  } catch {
    throw new Error(
      "GitHub CLI not authenticated. Run `gh auth login` (ensure token has repo scopes).",
    );
  }

  try {
    await execa("gh", ["api", `/orgs/${org}`], { stdio: "ignore" });
  } catch {
    throw new Error(
      `Cannot access org "${org}". Ensure it exists and your account/token has permissions.`,
    );
  }
}

export async function checkRepoAvailability(
  org: string,
  name: string,
): Promise<boolean> {
  try {
    await execa("gh", ["repo", "view", `${org}/${name}`], { stdio: "ignore" });
    // Repo exists → not available
    return false;
  } catch {
    // Non-zero (likely 404) → treat as available
    return true;
  }
}

export async function createRemoteRepo(
  org: string,
  name: string,
): Promise<GitHubRepoResponse> {
  const { stdout } = await execa("gh", [
    "api",
    "--method",
    "POST",
    "-H",
    "Accept: application/vnd.github+json",
    `/orgs/${org}/repos`,
    "-f",
    `name=${name}`,
    "-f",
    "visibility=public",
    "-f",
    "has_issues=false",
    "-f",
    "has_wiki=false",
  ]);

  const gitHubRepoResponse: unknown = JSON.parse(stdout);

  if (!isRepoResponse(gitHubRepoResponse)) {
    throw new Error("Unexpected GitHub API response shape");
  }

  return gitHubRepoResponse;
}

export async function ensureRemoteDefault(
  org: string,
  name: string,
  defaultBranch: string,
): Promise<void> {
  await execa("gh", [
    "api",
    "--method",
    "PATCH",
    "-H",
    "Accept: application/vnd.github+json",
    `/repos/${org}/${name}`,
    "-f",
    `default_branch=${defaultBranch}`,
  ]);
}
