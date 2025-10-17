import { execa } from "execa";
import type { Repo } from "../domain/repo.js";
import type { GitHost } from "../operations/create-repo/handler.js";

export function createGitHub(): GitHost {
  const gitHub = "gh";

  return Object.freeze({
    async createRepo(repo: Repo) {
      await execa(gitHub, [
        "repo",
        "create",
        repo.fullName,
        `--${repo.visibility}`,
      ]);
    },

    async deleteRepo(repo: Repo) {
      await execa(gitHub, ["repo", "delete", repo.fullName, "--yes"]);
    },
  });
}
