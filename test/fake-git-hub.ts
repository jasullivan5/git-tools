import { emptyDir, remove } from "fs-extra";
import { execa } from "execa";
import type { Repo } from "../src/domain/repo.js";
import { fileURLToPath } from "node:url";
import type { GitHost } from "../src/operations/create-repo/handler.js";

export function createFakeGitHub(): GitHost {
  return Object.freeze({
    async createRepo(repo: Repo) {
      const directory = fileURLToPath(repo.url);
      await emptyDir(directory);
      await execa("git", ["init", "--bare", directory]);
    },

    async deleteRepo(repo: Repo) {
      const directory = fileURLToPath(repo.url);
      await remove(directory);
    },
  });
}
