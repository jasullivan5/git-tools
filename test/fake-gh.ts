import path from "node:path";
import { mkdir, rm } from "node:fs/promises";
import { execa } from "execa";
import type { Repo } from "../src/operations/create-repo/domain/repo.js";

const REMOTES_ROOT =
  process.env["REMOTES_ROOT"] ?? path.join(process.cwd(), ".remotes");

const remotePath = (owner: string, name: string) =>
  path.join(REMOTES_ROOT, owner, `${name}.git`);

export async function createRepo(repo: Repo) {
  const directory = remotePath(repo.owner, repo.name);
  await mkdir(path.dirname(directory), { recursive: true });
  await execa("git", ["init", "--bare", directory]);
}

export async function deleteRepo(repo: Repo) {
  const directory = remotePath(repo.owner, repo.name);
  await rm(directory, { recursive: true, force: true });
}
