import { emptyDir, remove } from "fs-extra";
import { execa } from "execa";
import type { Repo } from "../src/operations/create-repo/domain/repo.js";
import { fileURLToPath } from "node:url";

export async function createRepo(repo: Repo) {
  const directory = fileURLToPath(repo.url);
  await emptyDir(directory);
  await execa("git", ["init", "--bare", directory]);
}

export async function deleteRepo(repo: Repo) {
  const directory = fileURLToPath(repo.url);
  await remove(directory);
}
