import path from "node:path";
import { emptyDir, remove } from "fs-extra";
import { execa } from "execa";
import type { Repo } from "../src/operations/create-repo/domain/repo.js";

const remotesRoot = ".remotes";

function remotePath(owner: string, name: string) {
  return path.join(remotesRoot, owner, `${name}.git`);
}

export async function createRepo(repo: Repo) {
  const directory = remotePath(repo.owner, repo.name);
  await emptyDir(directory);
  await execa("git", ["init", "--bare", directory]);
}

export async function deleteRepo(repo: Repo) {
  const directory = remotePath(repo.owner, repo.name);
  await remove(directory);
}
