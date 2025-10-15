import { mkdtemp, rm } from "fs-extra";
import { tmpdir } from "node:os";
import path from "node:path";

export interface Sandbox {
  root: string;
  cleanup: () => Promise<void>;
  within<T>(function_: (root: string) => Promise<T> | T): Promise<T>;
}

export async function createSandbox(prefix = "git-tools-"): Promise<Sandbox> {
  const root = await mkdtemp(path.join(tmpdir(), prefix));
  const origCwd = process.cwd();

  async function cleanup() {
    try {
      process.chdir(origCwd);
    } catch {
      // Even if this fails (rarely, if cwd was deleted), we still proceed to remove the sandbox.
    }
    await rm(root, { recursive: true, force: true });
  }

  async function within<T>(
    function_: (root: string) => Promise<T> | T,
  ): Promise<T> {
    process.chdir(root);
    try {
      return await function_(root);
    } finally {
      process.chdir(origCwd);
    }
  }

  return { root, cleanup, within };
}
