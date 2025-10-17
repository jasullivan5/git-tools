import { execa } from "execa";
import type { Repo } from "../domain/repo.js";

const gitHub = "gh";

export async function createRepo(repo: Repo) {
  await execa(gitHub, [
    "repo",
    "create",
    repo.fullName,
    `--${repo.visibility}`,
  ]);
}

export async function deleteRepo(repo: Repo) {
  await execa(gitHub, ["repo", "delete", repo.fullName, "--yes"]);
}
