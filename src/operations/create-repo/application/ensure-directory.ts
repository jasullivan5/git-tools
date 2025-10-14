import { ensureDir, pathExists } from "fs-extra";

export type DirectoryStatus = "unknown" | "existed" | "created";

export async function ensureDirectory(
  directory: string,
): Promise<DirectoryStatus> {
  const existed = await pathExists(directory);
  await ensureDir(directory);
  return existed ? "existed" : "created";
}
