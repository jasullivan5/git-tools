import { execa } from "execa";
import path from "node:path";
import os from "node:os";
import { mkdtemp, remove, move } from "fs-extra";

const organizationName = "jasullivan5-org";
const repoDestination = "/c/Users/jasul/repos";

export async function createRepo(repoName: string): Promise<string> {
  const localPath = path.join(repoDestination, repoName);
  const fullRepo = `${organizationName}/${repoName}`;
  const httpsUrl = `https://github.com/${fullRepo}.git`;
  const temporaryDirectoryPrefix = path.join(os.tmpdir(), "create-repo-");

  // 1) Create remote repo (non-interactive)
  await execa("gh", ["repo", "create", fullRepo, "--public"]);
  let temporaryDirectory: string | undefined;
  try {
    // 2) Create temporary directory
    temporaryDirectory = await mkdtemp(temporaryDirectoryPrefix);

    // 3) Clone into temp dir
    await execa("git", ["clone", httpsUrl, temporaryDirectory]);

    // 4) Move from temp to final location
    await move(temporaryDirectory, localPath, { overwrite: false });

    // 5) Success — return info
    return localPath;

    // If create temp dir, clone or move fails, delete remote repo if created
  } catch (error) {
    await Promise.allSettled([
      execa("gh", ["repo", "delete", fullRepo, "--yes"]),
      temporaryDirectory ? remove(temporaryDirectory) : Promise.resolve(),
    ]);
    throw error;
  }
}
