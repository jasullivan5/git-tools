import { execa } from "execa";
import type { GitHubRepo } from "../domain/git-hub-repo.js";

const gitHub = "gh";

export async function createRepo(repo: GitHubRepo) {
  await execa(gitHub, [
    "repo",
    "create",
    repo.fullName,
    `--${repo.visibility}`,
  ]);
}

export async function deleteRepo(repo: GitHubRepo) {
  await execa(gitHub, ["repo", "delete", repo.fullName, "--yes"]);
}
